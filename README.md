<br /><p align="center"><img src="./logo.png" width="128px" height="128px" /></p><br />

## _☕ Suqu is based on Vue's WeakMap reactivity subscriber system, using WeakMap for privacy and shadow tree for DOM rendeering._

<br />

<br />

```read
The system was made in 3 days and therefor not optimized for everything. 
Though we do have two features to play around with and you can eventually also try to go and add your own for fun.
```

<br />
<br />

> $placeholder
```read
    Access to values of the different variables.
```

> @change
```read
    Access to changes values of the diffrent variables.
```

<br />
<br />

> Scripts

- scripts/app.js # Is where the setup is done.

- scripts/attributes.js # Is the script that holds the different "custom" variables.

- scripts/globalGarbageCollector.js # Is the WeakMap and where the private instances are.

- scripts/subscriberToGlobalGarbageCollector.js # This is the instance for the global private WeakMap.

- scripts/subToSub.js # This is where the reactivity and subsriber is placed (incl. tracker and trigger).

- scripts/render.js # Is where the html is stored in a shadow tree and re-renders, etc.

- scripts/firstReactiveRender.js # Works as well but is a test area, and needs a line in the instance script to be uncommented to work.

<br />

### Have fun!
