#define PHONG

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

uniform float time;
uniform float uTheme;

varying vec2 vUv;
varying vec3 newPosition;
varying float noise;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>

  // LIGHT MODE COLORS
  vec3 lightBase = vec3(1.0);
  vec3 lightGlow = vec3(0.5);

  // DARK MODE COLORS
  vec3 darkBase = vec3(0.4);
  vec3 darkGlow = vec3(2.6);

  // switch colors by theme
  vec3 baseColor = mix(darkBase, lightBase, uTheme);

  vec3 glowColor = mix(darkGlow, lightGlow, uTheme);

  // stronger center glow
  float glowPattern =
    0.45 +
    (sin(noise * 8.0 + time * 0.5) * 0.25);

  glowPattern = clamp(glowPattern, 0.0, 1.0);

  vec3 finalColor = mix(
    baseColor,
    glowColor,
    glowPattern
  );

  vec4 diffuseColor = vec4(finalColor, 1.0);

  ReflectedLight reflectedLight = ReflectedLight(
    vec3(0.0),
    vec3(0.0),
    vec3(0.0),
    vec3(0.0)
  );

  vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>

	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	#include <aomap_fragment>

	vec3 outgoingLight =
    reflectedLight.directDiffuse +
    reflectedLight.indirectDiffuse +
    reflectedLight.directSpecular +
    reflectedLight.indirectSpecular +
    totalEmissiveRadiance;

  outgoingLight *= finalColor;

	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

  gl_FragColor = vec4(outgoingLight, 1.0);
}