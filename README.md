# Homework 4: L-systems

## Results
![Image1](https://github.com/QennyS/hw04-l-systems/blob/master/result.png)  \
Live link: https://qennys.github.io/hw04-l-systems/ \
Name: Yilei Li PennKey: 47053708

## Description
This project is to implement the L-System.

I also implmented a dusty, orange background by fbm noise function to incorporate the autumn theme.

### Drawing Rules
- `F`: expand forward and scale down a little bit
- `L`: draw a leaf
- `+`: rotate positively around Z axis
- `-`: rotate negatively around Z axis
- `~`: rotate positively around X axis
- `*`: rotate negatively around X axis
- `=`: rotate positively around Y axis
- `_`: rotate negatively around Y axis

The axiom is ```FX```.

### Randomness
The rorating amount is an angle with some random offset added.

## Controls
- `Iterations`: change the number of iterations in L-System
- `Angle`: change the angle in L-System
- `leaves_color`: change the color of leaves

## Sources
- [Online L-system renderer](http://www.kevs3d.co.uk/dev/lsystems/)
- [Algorithm of L-system](http://algorithmicbotany.org/papers/abop/abop-ch1.pdf)
