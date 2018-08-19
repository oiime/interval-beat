class IntervalBeatError extends Error {}

let _task_enumerator = 0
let _tasks = new Map()
let _options = {
  logger: console
}

function configure (options) {
  _options = Object.assign(options)
}

function add (task) {
  if (Array.isArray(task)) {
    return task.map(_task => add(_task))
  }
  if (!task.interval) throw new IntervalBeatError('task has no interval')
  if (!task.callback) throw new IntervalBeatError('task has no callback')

  ++_task_enumerator
  const id = _task_enumerator
  _tasks.set(id, Object.assign({
    waitFinished: true,
    throwError: false
  }, task))

  __beat(id)
  return id
}

function __beat (id, props) {
  if (!_tasks.has(id)) return // deleted
  const task = _tasks.get(id)
  if (!task.waitFinished) setTimeout(() => __beat(id), task.interval)

  let alreadyCalled = false

  const p = task.callback(props, (err, nextProps) => {
    if (alreadyCalled) throw new IntervalBeatError('you can not use both a promise return and a callback')
    alreadyCalled = true
    if (err) {
      this.__handleError(task, err)
      // we didnt beat before, do it now
      if (task.waitFinished) setTimeout(() => __beat(id, nextProps), task.interval)
    }
  })
  if (p instanceof Promise) {
    if (alreadyCalled) throw new IntervalBeatError('you can not use both a promise return and a callback')
    alreadyCalled = true
    // it's a promise
    p.then((nextProps) => {
      if (task.waitFinished) setTimeout(() => __beat(id, nextProps), task.interval)
    }).catch(err => {
      this.__handleError(task, err)
      if (task.waitFinished) setTimeout(() => __beat(id), task.interval)
    })
  }
}
function __handleError(task, err) {
  if (task.onError) task.onError(err)
  if (task.throwError) throw err
  if (_options.logger) _options.logger.error(err)
}

function remove (id) {
  _tasks.delete(id)
}

function getTasks () {
  return _tasks
}

function removeByProperty (propertyName, value) {
  _tasks.forEach((task, id) => {
    if (!task.hasOwnProperty(propertyName) || task[propertyName] !== value) return
    remove(id)
  })
}

module.exports = { add, remove, removeByProperty, getTasks, configure }
