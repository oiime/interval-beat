## about

`interval-beat` is a zero dependency module that allows running tasks in specific intervals waiting until the previous has has finished

## installation
```bash
npm install --save interval-beat
```

## by example

`interval-beat` has a pretty short simple code, the easiest way would be to just read through it

```javascript
const intervalBeat = require('interval-beat')


// configuration, not required
intervalBeat.configure({
  logger: someLogger, // some standard logger that follows the (.debug(), .error()), if set to null errors would be swallowed, default is console
})


// add task using a callback to signal you're done
intervalBeat.add({
  callback: (previousArgs, done) => {
    // do some stuff here

    // we're done
    done()
    // or optionally pass arugments for the next iteration
    done({ foo: 'bar' })
    // or throw an error instead
    done(new Error('an error has occured'))
  },
  interval: 5000 // interval time in ms
})

// add task using a promise to signal you're done
intervalBeat.add({
  callback: (previousArgs) => {
    // do some stuff here

    // we're done
    return Promise.resolve()
    // or optionally pass arugments for the next iteration
    return Promise.resolve({ foo: 'bar' })
    // or throw an error instead
    return Promise.reject(new Error('an error has occured'))
  },
  interval: 5000 // interval time in ms
})

// can also add multiple tasks by passing an array
intervalBeat.add([taskProperties, taskProperties])


// options for task
intervalBeat.add({
  callback: () => {}
  onError: (err) => {}, // call this if an error was returned by callback
  interval: 5000, // interval time in ms
  waitFinished: false, // run beat in actual interval, without waiting for the previous beat to finish, like a regular cron job, default is true
  throwError: true, // throws an unhandled error if any error happens during a task, default is false
})

// removing tasks
const id = intervalBeat.add(...)
intervalBeat.remove(id)

// removing a task by a property
intervalBeat.add({
  name: 'foo'
  callback: () => {},
})
intervalBeat.removeByProperty('name', 'foo')

```

License: MIT
