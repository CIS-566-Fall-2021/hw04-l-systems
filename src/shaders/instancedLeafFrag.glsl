#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;

in vec4 fs_Nor;

in float fs_Scale;

in vec4 fs_matCol0;
in vec4 fs_matCol1;
in vec4 fs_matCol2;
in vec4 fs_matCol3;

out vec4 out_Col;

void main()
{
    //float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
    //out_Col = vec4(dist) * fs_Col;

    //out_Col = fs_Col;

    out_Col = vec4(0.1647, 0.4863, 0.1373, 1.0);
}
