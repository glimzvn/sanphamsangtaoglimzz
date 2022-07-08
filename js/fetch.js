function reduceResult(results, noQ){
  return Object.entries(results)
  .map(a => a.pop())
  .map((a) => ({sort: Math.random(), value: a}))
  .sort((a, b) => a.sort - b.sort)
  .map((a) => a.value)
  .slice(0, noQ);
}