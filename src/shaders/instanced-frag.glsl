#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

void main()
{
    // float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
    // out_Col = vec4(dist) * fs_Col;

    // out_Col = fs_Col;
    vec4 lightPos = vec4(50., 50., 10., 0.);
    vec4 fs_LightVec = lightPos - fs_Pos;

    vec4 diffuseColor = fs_Col;
    float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec)); // / length(fs_LightVec);
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);
    float ambientTerm = 0.2;

    float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                        //to simulate ambient lighting. This ensures that faces that are not
                                                        //lit by our point light are not completely black.

    // Compute final shaded color
    out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);

    
}
