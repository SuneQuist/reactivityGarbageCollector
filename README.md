# suqu
## _A small Vue based reactivity system with a quick renderer_

<p align="center" width="500px" height="500px"><img src="./readme-files/suqu.svg" /><p>

```read
    The system was made in 3 days and therefor not optimized for everything.
    Though we do have two features to play around with, and you can eventually also try to go and add your own for fun.
```

> $placeholder
```read
    Access to values of the different variables.
```

> @change
```read
    Access to changes values of the diffrent variables.
```
> Scripts

- scripts/app.js # Is where the setup is done.

- scripts/attributes.js # Is the script that holds the different "custom" variables.

- scripts/globalGarbageCollector.js # Is the WeakMap and where the private instances are.

- scripts/subscriberToGlobalGarbageCollector.js # This is the instance for the global private WeakMap.

- scripts/subToSub.js # This is where the reactivity and subsriber is placed (incl. tracker and trigger).

- scripts/render.js # Is where the html is stored in a shadow tree and re-renders, etc.

- scripts/firstReactiveRender.js # Works as well but is a test area, and needs a line in the instance script to be uncommented to work.

### Have fun!