satellite.js
==============

Introduction
--------------

Provides the functions necessary for SGP4/SDP4 calculations as modular blocks. Also provides math for coordinate transforms.

Based off the python [sgp4 1.1 by Brandon Rhodes](https://pypi.python.org/pypi/sgp4/), in turn based off the C++ code written by [David Vallado, et al](http://www.celestrak.com/publications/AIAA/2006-6753/), which was in turn based off the original: [SpaceTrack Report #3, by Hoots and Roehrich](http://celestrak.com/NORAD/documentation/spacetrk.pdf).
The coordinate transforms are based off T.S. Kelso's columns: [Part I](http://celestrak.com/columns/v02n01/), [Part II](http://celestrak.com/columns/v02n02/), [Part III](http://celestrak.com/columns/v02n03/).
I would recommend everybody interested in satellite tracking or orbital propagation read [all of Kelso's columns](http://celestrak.com/columns/).


Note about Code Conventions used
--------------------------------

Like Brandon Rhodes before me, I chose to maintain as little difference between this implementation and the prior works. This is to make adapting future changes suggested by Vallado much simpler. Thus, some of the conventions used in this library are very weird.
