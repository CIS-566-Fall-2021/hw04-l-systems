#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene

in vec3 vs_Rotate; // Another instance rendering attribute used to position each quad instance in the scene

in vec3 vs_Scale; // Another instance rendering attribute used to position each quad instance in the scene

in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec2 fs_UV;

in vec4 vs_TransformX;
in vec4 vs_TransformY;
in vec4 vs_TransformZ;
in vec4 vs_TransformW;
in float vs_UVCell;

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;

float pi = 3.14159265359;
float degToRad = 3.14159265359 / 180.0;

float hash3(vec3 v)
{
    return fract(sin(dot(v, vec3(24.51853, 4815.44774, 32555.33333))) * 3942185.3);
}

mat4 rotationAxisAngle( vec3 v, float a )
{
    float si = sin( a );
    float co = cos( a );
    float ic = 1.0f - co;

    return mat4( v.x*v.x*ic + co,       v.y*v.x*ic - si*v.z,    v.z*v.x*ic + si*v.y, 0.0,
                   v.x*v.y*ic + si*v.z,   v.y*v.y*ic + co,        v.z*v.y*ic - si*v.x, 0.0,
                   v.x*v.z*ic - si*v.y,   v.y*v.z*ic + si*v.x,    v.z*v.z*ic + co, 0.0,
                0.0, 0.0, 0.0, 1.0);
}

vec2 transformUV()
{
    float tex_divs = 5.0;
    float uv_scale = 1.0 / tex_divs;
    float cel_y = uv_scale * floor(vs_UVCell * uv_scale);
    float cel_x = uv_scale * floor(mod(vs_UVCell, tex_divs));
    float nextcel_y = uv_scale * floor(vs_UVCell * uv_scale + 1.0);
    vec2 transformedUV = vs_UV;
    transformedUV *= uv_scale;
    transformedUV += vec2(cel_x, cel_y);
    //transformedUV.y = min(transformedUV.y, nextcel_y - 0.007);
    return transformedUV;
}

void main()
{
    fs_UV = transformUV();
    fs_Col = vs_Pos;
    mat4 transform = mat4(vs_TransformX, vs_TransformY, vs_TransformZ, vs_TransformW);
    
    float offX = hash3(1049.3214 * transform[3].xyz);
    float offY = hash3(92.333 + 2002.44 * transform[3].xyz);
    float offZ = hash3(3529.35 * transform[3].xyz);
    float angleOffset = (transform[3].x + transform[3].y + transform[3].z) * 0.1;

    vec4 translate = transform[3];
    //transform[0] *= 10.0;
    //transform[1] *= 3.0;
   // transform[2] *= 3.0;

    translate.x += offX * 1.5f;
    translate.x -= u_Time * 0.01 + 0.01 * offX;
    translate.y -=  offY + u_Time * 0.01;
    
    translate.xyz *= 15.0;

    mat4 rot = rotationAxisAngle(normalize(vec3(1.0, -1.0, 0.0)), 0.03 * u_Time + 2.0 * pi * angleOffset);
    transform = transform * rot;
    
    vec4 rotPos = rot * vs_Pos.xyzw;
    
    vec3 topPoint = vec3(30.0,70.0,0.0);
    vec3 bottomPoint = vec3(-30.0,-10.0,-20.0);
   // translate.xyz =  mod(bottomPoint + translate.xyz, abs(topPoint - bottomPoint));
    translate.x =  mod(translate.x, abs(topPoint - bottomPoint).x);
    translate.y =  mod(translate.y, abs(topPoint - bottomPoint).y);
    translate.xyz += bottomPoint;
    
    transform[3] = translate;
    vec4 modelPos = transform * vs_Pos;
    fs_Pos = modelPos;
    fs_Nor = transform * vs_Nor;
    gl_Position = u_ViewProj * modelPos;
}
