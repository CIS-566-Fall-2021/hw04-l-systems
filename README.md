# Homework 4: L-systems

Name: Benjamin Sei
Pennkey: bensei

Sources:
http://dev.thi.ng/gradients/
https://community.khronos.org/t/quaternion-functions-for-glsl/50140

3D l-system generator. The turtle class works in the same way l-systems
are generated in a 2D environment: the forward and up vector is stored, and tranformations are encoded using quaternions. For any sentence, the string
is expanded using a grammar (defined in main.ts) over the specified number of iterations, where each symbol in the sentence is converted to some action in DrawingRule. The grammar itself is structured as [character, List[probability, expansion]], that is each character has a list of possible expansions each of which has an associated probability of happening. Vertex data is computed in instanceData() in which each action of the turtle is simulated. The objs of cylinders and leaves are converted to mesh objects which are sent through the pipeline to be drawn as instances. The background is made using cosine color palette and 2d noise. The plant exhibits a tiny bit of sway that is enhanced at the higher points of the tree. 