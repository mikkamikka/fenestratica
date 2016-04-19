/**
 * Created by Mika on 19/04/16.
 */

var viewerSettings = {

	dim: { lineColor: 0x666666 },

	labelParams: {
		fontsize: 46,
		fontface: "Arial", // parameters for "labels" type of descriptions
		color: "rgba( 0, 0, 255, 1 )",
		borderColor: "rgba( 80, 80, 80, 1 )",
		backgroundColor: "rgba( 80, 80, 80, 1 )",
		borderThickness: 0,
		canvasResolution: 128
	},
	labelParamsLoads: {
		fontsize: 40,
		fontface: "Arial", // parameters for "labels" type of descriptions
		color: "rgba( 0, 0, 0, 1 )",
		borderColor: "rgba( 0, 0, 0, 1 )",
		backgroundColor: "rgba( 0, 0, 0, 0 )",
		borderThickness: 0,
		canvasResolution: 256
	},
	labelParamsDimensions: {
		fontsize: 40,
		fontface: "Arial", // parameters for "labels" type of descriptions
		color: "rgba( 80, 80, 80, 1 )",
		borderColor: "rgba( 0, 0, 0, 0 )",
		backgroundColor: "rgba( 255, 255, 255, 1 )",
		borderThickness: 0,
		canvasResolution: 256,
		scale: 100
	}
};

function interpolateValue( value1, value2, alignment ) {

	var interpolation = value1 * (1 - alignment) + value2 * alignment;

	return interpolation;
}

function createLabelDimension( pos, value, offset, color ) {
	if ( offset === undefined ) offset = new THREE.Vector3();
	var label = makeLabelSprite2( value, viewerSettings.labelParamsDimensions, color );
	label.position.set( pos.x + offset.x, pos.y + offset.y, pos.z + offset.z );
	label.scale.multiplyScalar( viewerSettings.labelParamsDimensions.scale );
	return label;
}

function makeLabelSprite2( message, parameters, in_color ) {


	//var font = parameters[ "font" ];
	var fontsize = parameters[ "fontsize" ];
	var fontface = parameters[ "fontface" ];
	var borderThickness = parameters[ "borderThickness" ];
	var color = in_color !== undefined ? in_color : parameters['color'];
	var borderColor = parameters[ "borderColor" ];
	var backgroundColor = parameters[ "backgroundColor" ];
	//var spriteAlignment = THREE.SpriteAlignment.topLeft;
	var size = parameters[ "canvasResolution" ];

	var canvas = document.createElement( 'canvas' );

	canvas.width = size;
	canvas.height = size;

	var context = canvas.getContext( '2d' );

	var metrics = context.measureText(message);
	var textWidth = metrics.width;


	//context.fillStyle = "#00ffff";
	//context.fillRect(0, 0, canvas.width, canvas.height);   // for debug only

	context.textAlign = "center";
	context.font = fontsize + 'px ' + fontface;

	// text color
	context.textBaseline = "middle";
	context.fillStyle = color;
	//context.fillText(message, borderThickness, fontsize + borderThickness, 1000);
	context.fillText( message, size / 2, size / 2 );

	// canvas contents will be used for a texture
	var texture = new THREE.Texture( canvas )
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial( {
		map: texture
		//color: 0x0000ff
		//transparent: true
		//useScreenCoordinates: false
	} );

	var sprite = new THREE.Sprite( spriteMaterial );

	//sprite.scale.set(1, 1, 1);
	return sprite;

	// function for drawing rounded rectangles
	function roundRect( ctx, x, y, w, h, r ) {
		ctx.beginPath();
		ctx.moveTo( x + r, y );
		ctx.lineTo( x + w - r, y );
		ctx.quadraticCurveTo( x + w, y, x + w, y + r );
		ctx.lineTo( x + w, y + h - r );
		ctx.quadraticCurveTo( x + w, y + h, x + w - r, y + h );
		ctx.lineTo( x + r, y + h );
		ctx.quadraticCurveTo( x, y + h, x, y + h - r );
		ctx.lineTo( x, y + r );
		ctx.quadraticCurveTo( x, y, x + r, y );
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

}

function makeDistanceLine( vectorArray, color ) {

	var material = new THREE.LineBasicMaterial( {
		color: color
	} );
	var geometry = new THREE.Geometry();

	for ( var i = 0; i < vectorArray.length; i++ )
		geometry.vertices.push( vectorArray[ i ] );

	return new THREE.Line( geometry, material );
}


function make3DObject( type, xPos, scale ) { // ARROWS MAKER

	var holder = new THREE.Object3D();

	switch ( type ) {

		case "arrowHead":
		{
			var arrowRadius = 0.09 * scale,
				arrowHeight = 0.45 * scale,
				arrowHeightSeg = 5 * scale,
				arrowTopSeg = 0;
			var arrowGeom = new THREE.CylinderGeometry( arrowRadius, 0, arrowHeight,
				arrowHeightSeg, arrowTopSeg );
			arrowGeom.applyMatrix( new THREE.Matrix4().makeTranslation( 0, arrowHeight / 2, 0 ) );
			var arrow = new THREE.Mesh( arrowGeom, holder.Ymat );
			arrow.arrowHeight = arrowHeight;
			return arrow;
		}
			break;
		default:
			console.error( "invalid gizmo type" );
	}

	//holder.axisPlanes = makeAxisPlane( holder );
	//_this.gizmos.push( holder );

	if ( xPos != undefined ) holder.position.setX( xPos );

	return holder;
}