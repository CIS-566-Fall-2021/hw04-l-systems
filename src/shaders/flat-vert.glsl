#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene

in vec4 vs_Pos;
out vec2 fs_Pos;

vec3 paletteTemp(float t)
{
    vec3 a = vec3(0.338, -0.002, 0.448);
    vec3 b = vec3(0.308, 0.528, 0.528);
    vec3 c = vec3(1.000, 0.558, 0.608);
    vec3 d = vec3(-0.032, -0.032, 0.528);
    vec3 ret = a + b*cos( 6.28318*(c*t+d) );
    return ret;
}

float random(vec2 p){
 	return abs(fract(184.421631 * sin(dot(p, vec2(1932.1902, 6247.4617)))));
}

float interpNoise2D(vec2 p)
{
  vec2 i = floor( p );
  vec2 f = fract( p );

  vec2 u = f*f*(3.0-2.0*f);

  return mix( mix( random( i + vec2(0.0,0.0) ), 
                    random( i + vec2(1.0,0.0) ), u.x),
              mix( random( i + vec2(0.0,1.0) ), 
                    random( i + vec2(1.0,1.0) ), u.x), u.y);
}

float fbm2d(vec2 v) {
  v*= 1.2;
  int octave = 4;
	float a = 1.0;
  float val = 0.0;
	for (int i = 0; i < octave; ++i) {
		val += a * abs(interpNoise2D(vec2(v.x, v.y)));
    v *= 2.;
		a *= 0.5;
	}
	return val;
}

void main() {
  fs_Pos = vs_Pos.xy;
  gl_Position = vec4( vs_Pos.x, vs_Pos.y, vs_Pos.z, 1.);
}
