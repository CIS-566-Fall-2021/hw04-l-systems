#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;

out vec4 out_Col;
in vec4 fs_Nor;
in vec2 fs_UV;
in mat3 fs_TBN;

uniform vec3 u_Eye;
uniform sampler2D u_Texture;
uniform sampler2D u_NormalMap;

void main()
{
    vec4 normMap = texture(u_NormalMap, fs_UV);
    vec3 normal = normalize(fs_TBN * normMap.xyz);
    vec4 col = texture(u_Texture, fs_UV);
    float alpha = col.w;
    if(col.w < 0.3) {
        discard;
    } else {
        alpha = 1.0;
    }
   // col = vec4(0.7, 0.7, 0.74, 1.0);

    vec3 lightPos = vec3(30.0, 50.0, 100.0);
    vec3 lightDir = normalize(lightPos - fs_Pos.xyz);
    lightDir = normalize(vec3(1.0, 0.0, 0.0));
    float ambient = 0.2;
    float diffuse = ambient + clamp(dot(normalize(normal), lightDir), 0.0, 1.0);
    
    float cosPow = 120.0;
    vec3 view = normalize(fs_Pos.xyz - u_Eye.xyz);
    vec3 h = normalize(lightDir - view);
    float specular = clamp(pow(max(dot(h, normal), 0.f), cosPow), 0.0, 10.0);
    
    float lightIntensity = diffuse + 0.6 * specular;
    
    vec3 diffuseColor = lightIntensity * col.xyz;
    out_Col = vec4(diffuseColor.xyz,alpha);
    
    //out_Col = vec4(specular, specular, specular, 1.0);
    
}
