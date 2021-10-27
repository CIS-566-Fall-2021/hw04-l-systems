#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;

out vec4 out_Col;
in vec4 fs_Nor;
in vec2 fs_UV;
uniform sampler2D u_Texture;

void main()
{
    
    vec4 col = texture(u_Texture, fs_UV);
    vec3 lightDir = normalize(vec3(1.0, 1.0, 0.0));
    float ambient = 0.3;
    float diffuse = ambient + clamp(dot(normalize(fs_Nor.xyz), lightDir), 0.0, 1.0);
    vec3 diffuseColor = diffuse * col.xyz;
    
    float alpha = col.w;
    if(col.w < 0.3) {
        discard;
    } else {
        alpha = 1.0;

    }
    
    out_Col = vec4(diffuseColor.xyz,alpha);
    
}
