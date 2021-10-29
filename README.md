# Homework 4: L-systems
Name: Nathaniel Korzekwa

PennKey: korzekwa

Live Demo: https://ciscprocess.github.io/hw04-l-systems/

<p align="center">
  <img src="https://user-images.githubusercontent.com/6472567/139194074-df0bc516-28ec-48e5-a916-5f169ea93197.png">
</p>
<p align="center">Sample generated tree.</p>

## Initial Process
Like many of the things I've worked on, this tree is definitely lacking in artistic
refinement. Looking at some of my classmates submissions is really eye-opening
for me.

That being said, most of my focus went to the L-System itself in this assignment,
with the idea of modeling a sort of "thorny"/"pine" looking tree without much
regard to matching any real-life tree. I was aiming for "prickly, yet elegant"
and to that end I believe I mostly succeeded. Kinda.

The main approach to my modeling was generating a 2D L-System that I could then
generalize to 3D.

<p align="center">
  <img src="https://user-images.githubusercontent.com/6472567/139194830-5ceb4154-85ef-4340-81c7-f21941e9466f.png">
</p>
<p align="center">Prototype L-System.</p>

I chose this structure as I felt the spaced-out and curved leaf nodes gave the
impression of sharpness but still had suave air to them. Additionally, I created
a 'part' in the recursive structure to the right to further add to (what I
thought would be) a sense of elegance.

### Implementation and 3D
It was relatively straightforward to generalize this to 3D: I added several
rotations around the Y-axis for original rotation around the (imaginary) Z-axis
in 2D. I decided to do more replications for the lower-part of the plant than
the higher part since the lower part gives the impression of fullness without
adding too much noise (like the upper part did when replicated too many times).

In addition, when implementing, I added several new operations to the L-system
grammar to add non-determinism.

### Areas for Growth
(toned this down plz don't kill me Rachel)

~~Okay, here we go. I am not happy with this submission outside of the L-System
itself. First of all, I am actually just using a scaled cube (!!!) for each of
the branches, and only change the color for the "pine-needles"/leaves. While
this actually works relatively well for what I was going for, it lacks refinement.~~

I am using a simple, deformed cube to represent both the leaves and the trunk
portions of my tree.

I had actually used Blender for the first time to generate a simple cylinder
to use for the branches, but this blew up for a number of reasons: 1. the Mesh
loader was NOT loading the .obj file exported by blender properly, 2. when
using the cylinder, my poor laptop nearly blew up at 3 iterations due to the
extra vertices/faces, and 3. it wasn't even that much better than the scaled
cube. So I stayed with the super-primitive form.

~~Finally, the silly little blue plane underneath the tree is just there to tick
off a box: Boooo.~~

I had hoped to get a nice little terrain going along with maybe a procedural sky,
but I ran out of time, and I was having trouble getting the terrain to generate
in an efficient manner. I probably would need to move the deformation code into
the CPU side and do it offline, but that would be a fair amount of work. So, in
the meanwhile, there is a simple square plane that has shader deformations applied
undert the tree.

I need to get a little 3D modeling experience and then maybe I can come revisit
this a little, however, I am at a bit of a loss on how to leverage 3D models to 
make my tree look nicer at the moment.

## References
- https://glmatrix.net/docs/module-mat4.html
- https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/inverse.xhtml
- https://encycolorpedia.com/01796f