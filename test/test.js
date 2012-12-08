var tape = require('tape')
var d = require('../')


  var assert = require('assert')
  function split(a) {
    if('string' === typeof a)
      return a.split('')
    return a
  }

  function test (a, b, lcs) {
    tape('lcs '+a+' '+b+' == '+lcs, function (assert) {
      a = split(a)
      b = split(b)
      lcs = split(lcs)
      var _lcs = d.lcs(a, b)
      d.chunk([a, b], console.log)
      assert.deepEqual(_lcs, lcs)
      var changes = d.diff(a,b)
      var newA = d.patch(a, changes)
      assert.deepEqual(newA, b)
      assert.end()
    })
  }

  test('AA', 'AA', 'AA')
  test('AB', 'BA', 'A')
  test('ABA', 'BAA', 'AA')
  test('TANYANA', 'BANANA', 'ANANA')
  // the naive model takes 2.5 seconds to find this:
  // time to optimise...
  test('aoenuthooao', 'eukmcybkraoaeuo', 'aoeuo')
  test('aoenuthooaeuoao', 'eukipoimcybkraoaeuo', 'euooaeuo')
  // added caching... now it's way faster.

  function test3way(args, expected) {
    tape('diff3 '+args.join(' ')+' === '+expected, function (assert) {
    args = args.map(split)

    var p = d.diff3.apply(null, args)
    var r = d.patch(args[0], p)
    assert.deepEqual(r, split(expected))
    assert.end()
    })
  }

  // [this, concestor, other], expected
  test3way(['abaaaa','aaaaa', 'aaacaa'], 'abaacaa')  // simple change
  test3way(['abaa','aaa', 'aacca'], 'abacca') // simple change
  test3way(['abaaa','aaaaa', 'abaaa'], 'abaaa') // same change aka 'false conflict'
  test3way(['aaaaa','aaccaaa', 'aaccaaba'], 'aaaaba') // simple delete
  // since b is deleted.
  test3way(['abaaa','abaaa', 'aacaa'], 'aacaa')
  // delete from middle and add to end.
  test3way(['aaa','axaa', 'axaab'], 'aaab') 
  test3way(['abaaba','aaaaa', 'aaacca'],
      ['a', 'b', 'a', 'a', {'?': [['b'], ['c','c']]}, 'a'])

  // in these tests, i've replaced something, but you have just deleted it.
  // it makes sense to merge my replace over your delete
  test3way(['aBc', 'abc', 'acD'], 'aBcD')
  test3way(['abaaa', 'aaaa', 'aacca'], 'abaacca')

  //note, it's possible for this case to occur in a
  //n-way merge where there is a delete and a false conflict.
  //most merges will be only 3 ways, so lets leave that for now.

  console.log(d.diff3(split("ABCXYZF"), split("ABDCEF"), split("AXBCEFG")))

  function assertDiffPatch (a, b) {
    a = split(a)
    b = split(b)
    var patch = d.diff(a, b)
    var patched = d.patch(a, JSON.parse(JSON.stringify(patch)))

    assert.deepEqual(b, patched)

  }

  assertDiffPatch('aabaab', 'abaab')
  assertDiffPatch([
    {a: true},
    {b: false}
  ], [
    {a: true},
    {b: false},
    {c: 6} 
  ])

