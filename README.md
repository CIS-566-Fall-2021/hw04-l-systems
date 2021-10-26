Name: Haowei Li\
Pennkey: lihaowei

## Description
An alien plant on a volcano. The plant sometimes looks like having arms and head.

## Live Demo
https://hli605.github.io/hw04-l-systems/

## Pictures
Screenshot1
![](./screenshot1.png)

Screenshot2
![](./screenshot2.png)

Screenshot3
![](./screenshot3.png)

## Techniques used
- L-System: used three different grammar set. During each iteration, the turtle would choose one of the three to expand the grammar. In the grammar, besides the regular "F" for "Move Forward" and "X" for expansion, there are "1" and "9" for "Rotation along the X axis", "2" and "8" for "Rotation along the Y axis", and "3" and "7" for "Rotation along the Z axis". I used four columns as arrays to represent the instance transformation.
- Background: used fractal-brownian-motion to procedurally generate the fog effect on the background. Increase the likeness of the scene to a volcano.
- GUI: the user is allowed to change the number of iterations, the base angle of rotation, and the branch, leaf, and ground color.