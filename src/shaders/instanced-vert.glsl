#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec4 vs_Rotate; //Instance of a noramlized quaternion
in vec3 vs_Scale;
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec4 fs_Col;
out vec4 fs_Pos;

//https://community.khronos.org/t/quaternion-functions-for-glsl/50140
vec3 transformQuat(vec3 a, vec4 q) {
    return a + 2.0*cross(cross(a, q.xyz ) + q.w*a, q.xyz);

    float qx = q[0];
    float qy = q[1];
    float qz = q[2];
    float qw = q[3];
    float x = a[0];
    float y = a[1];
    float z = a[2];

    float uvx = qy * z - qz * y;
    float uvy = qz * x - qx * z;
    float uvz = qx * y - qy * x;
  // var uuv = vec3.cross([], qvec, uv);
    float uuvx = qy * uvz - qz * uvy;
    float uuvy = qz * uvx - qx * uvz;
    float uuvz = qx * uvy - qy * uvx;
  // vec3.scale(uv, uv, 2 * w);
  float w2 = qw * 2.;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2;
  // vec3.scale(uuv, uuv, 2);
  uuvx *= 2.;
  uuvy *= 2.;
  uuvz *= 2.;
  // return vec3.add(out, a, vec3.add(out, uv, uuv));
  
  return vec3(x + uvx + uuvx, y + uvy + uuvy, z + uvz + uuvz);
}

//https://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
vec3 rotate_vertex_position(vec3 position)
{ 
  vec3 v = position.xyz;
  return v + 2.0 * cross(vs_Rotate.xyz, cross(vs_Rotate.xyz, v) + vs_Rotate.w * v);
}

void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;

    vec3 offset = vs_Translate;
    //vec3 xRot = rotatex(vs_Pos, vs_Rotate.x);
    //offset.z = (sin((u_Time + offset.x) * 3.14159 * 0.1) + cos((u_Time + offset.y) * 3.14159 * 0.1)) * 1.5;

    vec3 billboardPos = offset + vs_Pos.x * u_CameraAxes[0] + vs_Pos.y * u_CameraAxes[1];

    gl_Position = u_ViewProj * vec4(billboardPos, 1.0);
}
