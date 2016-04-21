/**
 * Created by Mika on 18/04/16.
 */

var viewer = new Viewer( "cad-view" );

viewer.Init();

function Viewer( divID ){

	var _this = this;

	this.Init = init;

	var container = $( "#" + divID )[ 0 ];

	this.container = container;



	var structureDescription = {

		outerElement: [ { center: new THREE.Vector3(0,300,0), start: new THREE.Vector3(), end: new THREE.Vector3(), length: 1000, orientation: 'horizontal' },
						{ center: new THREE.Vector3(0,-300,0), start: new THREE.Vector3(), end: new THREE.Vector3(), length: 1000, orientation: 'horizontal' },
						{ center: new THREE.Vector3(-500, 0, 0), start: new THREE.Vector3(), end: new THREE.Vector3(), length: 600, orientation: 'vertical' },
						{ center: new THREE.Vector3(500, 0, 0), start: new THREE.Vector3(), end: new THREE.Vector3(), length: 600, orientation: 'vertical' }
		],

		middleElement: [ { center: new THREE.Vector3(), start: new THREE.Vector3(), end: new THREE.Vector3(), length: 600, orientation: 'vertical'  }

		]

	};

	var structureWindowsDescription = {

		panels: [
			{ center: new THREE.Vector3(0,0,0), width: 300, height: 1000,
						leftTop: new THREE.Vector2( -500, 300 ), rightBottom: new THREE.Vector2( 0, - 300 ), surfaceLoad: 1200 },

			{ center: new THREE.Vector3(0,0,0), width: 300, height: 1000,
						leftTop: new THREE.Vector2( 0, 300 ), rightBottom: new THREE.Vector2( 500, - 300 ), surfaceLoad: 800 }

		]

	}

	this.structureDescription = structureDescription;

	this.structureWindowsDescription = structureWindowsDescription;



	this.editableElements = [];

	var sideElementModel, middleElementModel;

	function init(){

		initRenderer();

		initEditor();

		load3DSolids();

		//createDesignScene();

	}


	function initRenderer(){

		var container = $( "#" + divID )[ 0 ];

		_this.container = container;

		_this.width = container.clientWidth;
		_this.height = container.clientHeight;

		_this.scene = new THREE.Scene();

		_this.controls = undefined; //initialized in addControls()

		_this.camera = undefined;

		_this.cameraHomePos = new THREE.Vector3( 0, 0, 1000 );

		this.cameraBaseZoom = 35; //initial camera zoom

		this.camNear = 0.1; //min value for camera frustum
		this.camFar = 1000; //max value for camera frustum
		this.minZoom = 4; //min amount of zoom for camera
		this.maxZoom = 80; //max amount of zoom for camera


		addLight();
		addCamera();
		addRenderer();

		addCameraControls();

		animate();

		//window.addEventListener( 'resize', onWindowResize, false );

		//container.addEventListener( 'click', onMouseClick, false );

		//onWindowResize( _this.width, _this.height );

		function addLight() {

			var volumeScale = 5;

			// -also adds an ambient light to the gizmo scene
			var ambientLight = new THREE.AmbientLight( 0x333333 );
			_this.scene.add( ambientLight );

			var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
			directionalLight.position.set( - 100, 50, 100 );
			_this.scene.add( directionalLight );

			var pointLight = new THREE.PointLight( 0xffffff, 0.3 );
			pointLight.position.set( -100 * volumeScale, 50 * volumeScale, 0 );
			_this.scene.add( pointLight );

			var pointLight1 = new THREE.PointLight( 0xffffff, 0.2 );
			pointLight1.position.set( 60, 5 * volumeScale, 50 * volumeScale );
			pointLight1.position.multiplyScalar( 1.5 );
			_this.scene.add( pointLight1 );

		}

		function addCamera() {

			_this.camera = new THREE.OrthographicCamera( _this.width / -2, _this.width / 2,
				_this.height / 2, _this.height / -2, _this.camNear, _this.camFar );

			_this.camera.position.copy( _this.cameraHomePos );

			_this.scene.add( _this.camera );

		}

		function addCameraControls() {

			_this.controls = new THREE.OrbitControls( _this.camera, _this.renderer.domElement );
			//_this.controls.maxZoom = _this.maxZoom;
			//_this.controls.minZoom = _this.minZoom;
			_this.controls.zoom = _this.cameraBaseZoom;

			controlsState( "orbit" );

		}

		function controlsState( state ) {
			switch ( state ) {
				case "orbit":
					//_this.controls.noRotate = false;
					//_this.controls.noPan = false;
					//_this.controls.noZoom = false;

					_this.controls.enableDamping = true;
					_this.controls.dampingFactor = 0.5;
					_this.controls.enableZoom = true;

					break;
				case "pan":
					_this.controls.noPan = false;
					_this.controls.noZoom = true;
					_this.controls.noRotate = true;
					break;
				case "zoom":
					_this.controls.noZoom = false;
					_this.controls.noRotate = true;
					_this.controls.noPan = true;
					break;
			}
		}

		function addRenderer() {

			_this.renderer = new THREE.WebGLRenderer( {
				antialias: true,
				alpha: true
			} );

			_this.renderer.setSize( _this.width, _this.height );

			_this.renderer.autoClear = false;

			container.appendChild( _this.renderer.domElement );

			//console.log( container );
		}

		function animate( time ) {

			// -frameID variable can be used to stop rendering
			_this.frameID = requestAnimationFrame( animate );

			_this.controls.update();

			//if ( _this.designRenderOn ) render();

			render();

		}

		function render() {

			_this.renderer.clear();
			_this.renderer.setViewport( 0, 0, _this.width, _this.height );
			_this.renderer.render( _this.scene, _this.camera );

		}

	}

	function load3DSolids(){

		var modelsLoaded = false;

		var modelLoaded = [];

		initObjRealModels();

		function initObjRealModels() {

			// real model of side profiles element
			//var filename = 'media/rod_full.obj';
			//var mtl_name = 'media/rod_full.mtl';

			var filename = '3Dmodels/sideprofilesextruded.obj';

			function assignSideElement( object ){

				sideElementModel = object;

				modelLoaded[0] = true;

				modelsLoaded = modelLoaded[0] && modelLoaded[1];

				if ( modelsLoaded ) createDesignScene();
			}

			//loadObjRealModel_mtl( filename, mtl_name, assignSupportModel );
			load3DModel( filename, assignSideElement );


			// real model of middle profiles element
			//filename = 'media/clamp_full.obj';
			//mtl_name = 'media/clamp_full.mtl';

			var filename = '3Dmodels/MiddleProfile1extruded.obj';


			function assignMiddleElement( object ){

				middleElementModel = object;

				modelLoaded[1] = true;

				modelsLoaded = modelLoaded[0] && modelLoaded[1];

				if ( modelsLoaded ) createDesignScene();
			}

			//loadObjRealModel_mtl( filename, mtl_name, assignLoadPointModel );
			load3DModel( filename, assignMiddleElement );

		}

		function loadObjRealModel_mtl( name, mtl_name, callback ){

			var onProgress = function ( xhr ) {
				if ( xhr.lengthComputable ) {
					var percentComplete = xhr.loaded / xhr.total * 100;
					console.log( Math.round(percentComplete, 2) + '% downloaded' );
				}
			};

			var onError = function ( xhr ) {
			};

			//THREE.ImageUtils.crossOrigin = "anonymous";

			var loader = new THREE.OBJMTLLoader();
			loader.load( name, mtl_name, function ( object ) {

				object.traverse( function ( child ) {

					if ( child.name == "Fix" ) {

						//console.log( child );

						for ( var i = 0; i < child.children.length; i ++ ) {

							child.children[ i ].material.color = new THREE.Color( 0.7, 0.7, 0.7 );

						}

					}

					if ( child.name == "Dubel" ) {

						//console.log( child );

						for ( var i = 0; i < child.children.length; i ++ ) {

							child.children[ i ].material.color = new THREE.Color( 0.0, 0.0, 0.0 );

						}

					}

					//if ( child instanceof THREE.Mesh ) {
					//
					//
					//	console.log( "child.geometry.faces.length = ", child.geometry.faces.length );
					//	console.log( "child.geometry.vertices.length = ", child.geometry.vertices.length );
					//
					//
					//	//child.material.metal = true;
					//	//child.material.fog = false;
					//
					//}

				} );

				for ( var i = 0; i < object.children.length; i++ ){


					object.children[ i ].children[0] = undefined;
					object.children[ i ].children.splice( 0, 1 );

					//for ( var j = 0; j < object.children[ i ].children.length; j++ ){
					//
					//	var mesh = object.children[ i ].children[ j ];
					//
					//}

				}

				object.rotation.x += Math.PI / 2;

				object.scale.set( 0.03, 0.03, 0.03 );

				callback( object );

				if ( modelsLoaded ) LoadModel();

			}, onProgress, onError );

		}

		function load3DModel( name, callback ){

			var manager = new THREE.LoadingManager();
			manager.onProgress = function ( item, loaded, total ) {
				console.log( item, loaded, total );
			};

			var onProgress = function ( xhr ) {
				if ( xhr.lengthComputable ) {
					var percentComplete = xhr.loaded / xhr.total * 100;
					console.log( Math.round(percentComplete, 2) + '% downloaded' );
				}
			};
			var onError = function ( xhr ) {
			};

			var loader = new THREE.OBJLoader( manager );

			loader.load( name, function ( object ) {

				object.traverse( function ( child ) {

					if ( child instanceof THREE.Mesh ) {

						if ( child.name === '' ) {

							//console.log( child.geometry.boundingSphere.center );

						}

						console.log( child );

					}

				} );


				callback( object );

			}, onProgress, onError );

		}

	}

	function initEditor(){

		var mouse = { x:0, y:0 };

		var raycaster = new THREE.Raycaster();

		addUserInteractions();

		function addUserInteractions() {

			var $canvas = $( "canvas" );

			//$canvas.onclick = onMouseClick( event );  /// somehow this appeared not working, at least in Chrome. changed to 'addEventListener'

			$canvas.mousedown( function ( event ) {
				onMouseDown( event )
			} );
			$canvas.mousemove( function ( event ) {
				onMouseMove( event );
			} );
			$canvas.mouseup( function ( event ) {
				onMouseUp( event )
			} );
			$canvas.dblclick( function ( event ) {
				onDoubleClick( event )
			} );
			//window.keydown( function ( event ) {
			//	onKeyDown( event )
			//} );
			//window.keyup( function ( event ) {
			//	onKeyUp( event )
			//} );

		}


		function onMouseDown( event ) {

			//sets a new mouse vector for measuring distance since mouse down
			//mouseXmark = event.clientX;
			//mouseDown = true;
			//var obj;
			//if ( (obj = castRay( _this.loaderComponent.gizmos )) != undefined ) {
				/*
				 -casts a ray and checks if it hit anything valid
				 -selects a valid gizmo
				 -resets emissive color for all gizmos
				 -sets selected emissive color for selected gizmo
				 */
				//_this.selectedGizmo = obj.object;
				//toggleInput( false );

				//adds a user action (for undo) if the gizmo rotates
				//if ( holdingCtrl )
				//	_this.addActionProperty( _this.selectedGizmo, {
				//		before: _this.loaderComponent.copyEuler( _this.selectedGizmo.rotation )
				//	} );
				//else
				//	_this.addActionProperty( _this.selectedGizmo, {
				//		before: _this.loaderComponent.copyV3( _this.selectedGizmo.position )
				//	} );

				//resetGizmoEmissive(); //deselects other selected gizmos
				//_this.selectedGizmo.material.emissive = gizmoSelectedColor;
			//} //else resetGizmoEmissive(); //if nothing valid is hit, resets all gizmo emissive colors
		}

		function onMouseMove( event ) {
			/*
			 -method is called when the mouse is moved
			 -rotates the directional light to always match the normalized camera rotation vector,
			 always shining a light where the user is looking
			 -if a valid gizmo is selected, and the user is holding CTRL, rotate that gizmo;
			 -if CTRL is not pressed, just move it
			 */
			if ( !_this.loaderComponent ) return;

			updateMousePos( event );

			//moveLightWithCamera();

			// if (_this.selectedGizmo) {
			//   if (holdingCtrl && (_this.selectedGizmo.gizmoType == "loadPoint"
			//     || _this.selectedGizmo.gizmoType == "linear"))
			//     detectMouseMoveDirection(event);
			//   else moveGizmo();
			// }

		}

		function onMouseUp() {
			//if ( !_this.loaderComponent ) return;
			////re-enables user input and updates modified node
			//mouseDown = false;
			//if ( _this.selectedGizmo ) {
			//
			//	//_this.viewerComponent.UpdateGraphModel();
			//
			//	var gizmoPos = _this.loaderComponent.twoDecVec3( _this.selectedGizmo.position );
			//	if ( !holdingCtrl )
			//		_this.addActionProperty( _this.selectedGizmo, {
			//			after: _this.loaderComponent.copyV3( gizmoPos )
			//		} );
			//	updateNode( _this.selectedGizmo, gizmoPos.x );
			//	addAction( _this.selectedGizmo );
			//	_this.loaderComponent.beamDetails.lastSelected = _this.selectedGizmo;
			//	_this.selectedGizmo = undefined;
			//	toggleInput( true );
			//}
		}

		function onKeyUp( event ) {
			//detectCTRLkey( event, false )
		}

		function onKeyDown( event ) {
			//detectCTRLkey( event, true )
		}

		function onMouseClick( event ) {

			//if ( !_this.loaderComponent ) return;
			//
			//updateMousePos( event );
			//
			//var all = _this.loaderComponent.gizmos; //.concat( _this.loaderComponent.sprites );
			//
			//var obj;
			//
			//if ( ( obj = castRay( all ) ) != undefined ) {
			//
			//	_this.selectedGizmo = obj.object;
			//
			//
			//	if ( _this.selectedGizmo.gizmoType == "support" ) {
			//
			//		if ( _this.viewerComponent.onUserClickSupport != undefined ){
			//
			//			_this.viewerComponent.onUserClickSupport( _this.selectedGizmo.node.id );
			//
			//		}else{
			//
			//			console.warn( "onUserClickSupport: Callback function is not set" );
			//		}
			//
			//	}
			//
			//	if ( _this.selectedGizmo.gizmoType == "loadPoint"
			//		|| _this.selectedGizmo.gizmoType == "distributed"
			//		|| _this.selectedGizmo.gizmoType == "bending"
			//	) {
			//
			//		if ( _this.viewerComponent.onUserClickLoadPoint != undefined ){
			//
			//			_this.viewerComponent.onUserClickLoadPoint( _this.selectedGizmo.parentNode.id );
			//
			//		}else{
			//
			//			console.warn( "onUserClickLoadPoint: Callback function is not set" );
			//		}
			//
			//	}
			//
			//}

		}

		function onDoubleClick( event ) {

			updateMousePos( event );

			var all = _this.editableElements;

			var obj;

			if ( ( obj = castRay( all ) ) != undefined ) {

				_this.selectedGizmo = obj.object;

				// double click on main dimension line label
				if ( _this.selectedGizmo.type == "dimension"
					//|| _this.selectedGizmo.gizmoType == "dimension"

				) {

					console.log( _this.selectedGizmo.nodeID, _this.selectedGizmo.orientation )

					_this.updateNodePosition( _this.selectedGizmo.nodeID, _this.selectedGizmo.orientation, event );

					//if ( _this.viewerComponent.onUserSelectBeamLength != undefined ){
					//
					//	_this.viewerComponent.onUserSelectBeamLength();
					//
					//}else{
					//
					//	console.warn( "Callback function is not set" );
					//}

					//onMouseUp();
					return;

				}


				//onMouseUp();

			} //else resetGizmoEmissive();
		}

		function detectCTRLkey( event, bool ) {
			//if ( bool == holdingCtrl ) return;
			//if ( _this.selectedGizmo && _this.selectedGizmo.Action &&
			//	_this.selectedGizmo.Action.arg.before.constructor == THREE.Vector3 )
			//	_this.selectedGizmo.Action = undefined;
			//
			//if ( event.keyCode == 17 ) holdingCtrl = bool;
		}

		function updateMousePos( event ) {

			var offset = $( container ).offset();
			mouse.x = ((event.clientX - (offset.left - $(window).scrollLeft())) / _this.width) * 2 - 1;
			mouse.y = -((event.clientY - (offset.top - $(window).scrollTop())) / _this.height) * 2 + 1;

		}

		function castRay( array ) {
			/*
			 -perform a raycast to an array received as an argument
			 -if a valid mesh is found, its returned. if not, return undefined
			 */
			raycaster.setFromCamera( mouse, _this.camera );
			var intersects = raycaster.intersectObjects( array, false );
			if ( intersects[ 0 ] ) {
				//toggleInput( false );
				return intersects[ 0 ];
			} else return undefined;
		}

		function toggleInput( bool ) {
			_this.controls.enabled = bool;
		}

	}

	this.createDesignScene = createDesignScene;

	var firstLaunch = true;

	function createDesignScene(){

		_this.profilesLayer = createProfiles();

		_this.panelsLayer = createPanelElements();

		_this.scene.add( _this.profilesLayer );

		_this.scene.add( _this.panelsLayer );

		_this.surfaceLoadLayer = _this.createSurfaceLoadLayer();

		_this.scene.add( _this.surfaceLoadLayer );

		_this.dimensionChain = _this.createDimensionChain();

		_this.scene.add( _this.dimensionChain );


		function createProfiles(){

			//console.log( sideElementModel );

			//console.log( structureDescription );

			var profiles = new THREE.Object3D();


			var firstMeshSide =  sideElementModel.children[ 0 ];

			//if ( firstMeshSide.geometry.boundingSphere === null )
				firstMeshSide.geometry.computeBoundingSphere();

			console.log( firstMeshSide.geometry.boundingSphere.center );

			var shiftSideElement = firstMeshSide.geometry.boundingSphere.center;

			if ( firstLaunch ) recalcuatePositions( sideElementModel, shiftSideElement );

			sideElementModel.scale.x = 0.2;
			sideElementModel.scale.y = 0.2;
			//sideElementModel.scale.z = 10;

			sideElementModel.rotation.x = - Math.PI / 2;
			sideElementModel.rotation.z = - Math.PI / 2;


			var firstMeshMiddle =  middleElementModel.children[ 0 ];

			if ( firstMeshMiddle.geometry.boundingSphere === null ) firstMeshMiddle.geometry.computeBoundingSphere();

			//console.log( firstMeshSide.geometry.boundingSphere.center );

			var shiftMiddleElement = firstMeshMiddle.geometry.boundingSphere.center;

			shiftMiddleElement.y -= 40;

			if ( firstLaunch ) recalcuatePositions( middleElementModel, shiftMiddleElement );

			middleElementModel.scale.x = 0.2;
			middleElementModel.scale.y = 0.2;
			//sideElementModel.scale.z = 10;

			middleElementModel.rotation.x = - Math.PI / 2;
			middleElementModel.rotation.z = - Math.PI;



			for ( var i = 0; i < structureDescription.outerElement.length; i++ ){

				var element = sideElementModel.clone();

				element.position.x = structureDescription.outerElement[ i ].center.x;
				element.position.y = structureDescription.outerElement[ i ].center.y;
				element.position.z = structureDescription.outerElement[ i ].center.z;

				element.scale.z = 0.1 * structureDescription.outerElement[ i ].length;

				if ( structureDescription.outerElement[ i ].orientation === 'horizontal' ){

					element.rotation.y = Math.PI / 2;

				}

				profiles.add( element );

			}

			for ( var i = 0; i < structureDescription.middleElement.length; i++ ){

				var element = middleElementModel.clone();

				element.position.x = structureDescription.middleElement[ i ].center.x;
				element.position.y = structureDescription.middleElement[ i ].center.y;
				element.position.z = structureDescription.middleElement[ i ].center.z;

				element.scale.z = 0.1 * structureDescription.middleElement[ i ].length;

				if ( structureDescription.middleElement[ i ].orientation === 'horizontal' ){

					element.rotation.y = Math.PI / 2;

				}

				profiles.add( element );

			}

			firstLaunch = false;

			return profiles;

		}

		function createPanelElements(){

			var panels = new THREE.Object3D();


			var windowGeometry = new THREE.BoxGeometry( 1,1,1 );
			var windowMaterial = new THREE.MeshPhongMaterial({
				color: 0x0099cc,
				specular: 0xffffff,
				shininess: 30,
				transparent: true,
				opacity: 0.4
			});
			var windowMesh = new THREE.Mesh( windowGeometry, windowMaterial );

			windowMesh.scale.z = 3;

			windowMesh.position.z += 6;

			createPanels();

			function createPanels(){

				for ( var i = 0; i < structureWindowsDescription.panels.length; i++ ){

					var panel = windowMesh.clone();

					panel.scale.x = 1 * ( structureWindowsDescription.panels[ i ].rightBottom.x - structureWindowsDescription.panels[ i ].leftTop.x );

					panel.scale.y = 1 * ( structureWindowsDescription.panels[ i ].leftTop.y - structureWindowsDescription.panels[ i ].rightBottom.y );

					var posX = ( structureWindowsDescription.panels[ i ].rightBottom.x + structureWindowsDescription.panels[ i ].leftTop.x ) /2 ;

					panel.position.x = posX;// + structureWindowsDescription.panels[ i ].width / 2;

					panels.add( panel );

				}

			}

			return panels;

		}

		function recalcuatePositions( object, shift ){

			object.traverse( function ( child ) {

				if ( child instanceof THREE.Mesh ) {

					//var length = child.geometry.attributes.position.count;
					//
					//for ( var i = 0; i < length; i+=3 ){
					//
					//	child.geometry.attributes.position.array[ i ] -= shift.x;
					//	child.geometry.attributes.position.array[ i + 1 ] -= shift.y;
					//	child.geometry.attributes.position.array[ i + 2 ] -= shift.z;
					//
					//}
					//
					//child.geometry.attributes.position.needsUpdate = true;

					child.position.x -=  shift.x;
					child.position.y -=  shift.y;
					child.position.z -=  shift.z;

				}

			} );

		}

	}

}

var nodesH = [ { x: -500, y: 300 }, { x: 0, y: 300 }, { x: 500, y: 300 } ];
var nodesV = [ { x: -500, y: 300 }, { x: -500, y: -300 } ];

var nodes = [ [ { id: 0, x: -500, y: 300  }, { id: 1, x: 0, y: 300  }, { id: 2, x: 500, y: 300  } ],
			  [ { id: 3, x: -500, y: -300 }, { id: 4, x: 0, y: -300 }, { id: 5, x: 500, y: -300 } ]

];

function getNode( id ){

	for ( var i = 0; i < nodes.length; i++ ){

		for ( var j = 0; j < nodes[ i ].length; j++ ){

			if ( nodes[ i ][ j ].id === id ) return nodes[ i ][ j ];

		}

	}

}

var bars = [ { start: getNode(0), end: getNode(1) }, { start: getNode(1), end: getNode(2) },
			 { start: getNode(3), end: getNode(4) }, { start: getNode(4), end: getNode(5) },
	{ start: getNode(0), end: getNode(3) },
	{ start: getNode(1), end: getNode(4) },
	{ start: getNode(2), end: getNode(5) }
];

var beams = [];

for ( var i = 0; i < nodes.length; i++ ){

	beams[ i ] = { start: nodes[ i ][ 0 ], end: nodes[ i ][ nodes[ i ].length - 1 ] };
	beams[ i ].orientation = 'horizontal';

}

for ( var i = 0; i < nodes[ 0 ].length; i++ ){

	var newbeam = { start: nodes[ 0 ][ i ], end: nodes[ nodes.length - 1 ][ i ] };
	newbeam.orientation = 'vertical';

	beams.push( newbeam );

}


console.log( "beams: ", beams );

Viewer.prototype.updateNodePosition = function( nodeID, orientation, event ){

	var _this = this;

	var newValue;

	var n = document.createElement("input");
	n.setAttribute("type", "number");
	n.className = "inputValue";
	n.style.position = 'absolute';
	n.style.top = event.clientY.toString() + 'px';
	n.style.left = event.clientX.toString() + 'px';
	n.style.zIndex = 10;
	n.autofocus = true;
	n.onchange = function(){

		newValue = n.value;

		_this.container.removeChild( n );

		n = null;

		setNewValue( newValue );

	};

	this.container.appendChild( n );

	function setNewValue( val ){

		if ( orientation == 'horizontal' ){

			if ( nodeID==0 ){

				nodesH[ 0 ].x = - Number( val );
				nodesV[ 0 ].x = - Number( val );
				nodesV[ 1 ].x = - Number( val );

			}else if ( nodeID==1 ){

				nodesH[ 2 ].x = Number( val );

			}else if ( nodeID==-1 ){

				var newRightNodePos = Number( val ) - ( nodesH[ 1 ].x - nodesH[ 0 ].x );

				if ( newRightNodePos >= 100 ){

					nodesH[ 2 ].x = Number( newRightNodePos );

				}else{

					nodesH[ 2 ].x = 100;

					nodesH[ 0 ].x = - ( Number( val ) - 100 );
					nodesV[ 0 ].x = - ( Number( val ) - 100 );
					nodesV[ 1 ].x = - ( Number( val ) - 100 );

				}



			}

			_this.structureDescription.outerElement[ 0 ].length = nodesH[ 2 ].x + Math.abs( nodesH[ 0 ].x );
			_this.structureDescription.outerElement[ 1 ].length = nodesH[ 2 ].x + Math.abs( nodesH[ 0 ].x );
			_this.structureDescription.outerElement[ 0 ].center.x = ( nodesH[ 2 ].x + nodesH[ 0 ].x ) / 2;
			_this.structureDescription.outerElement[ 1 ].center.x = ( nodesH[ 2 ].x + nodesH[ 0 ].x ) / 2;

			_this.structureDescription.outerElement[ 2 ].center.x = nodesH[ 0 ].x;
			_this.structureDescription.outerElement[ 3 ].center.x = nodesH[ 2 ].x;

			//_this.structureDescription.middleElement[ 0 ].length = Number( val );

			_this.structureWindowsDescription.panels[ 0 ].leftTop.x = nodesH[ 0 ].x;
			_this.structureWindowsDescription.panels[ 0 ].rightBottom.x = nodesH[ 1 ].x;
			_this.structureWindowsDescription.panels[ 1 ].leftTop.x = nodesH[ 1 ].x;
			_this.structureWindowsDescription.panels[ 1 ].rightBottom.x = nodesH[ 2 ].x;

		}else{

			nodesH[ 0 ].y = Number( val/2 );
			nodesH[ 1 ].y = Number( val/2 );
			nodesH[ 2 ].y = Number( val/2 );

			nodesV[ 0 ].y = - Number( val/2 );
			nodesV[ 1 ].y = Number( val/2 );

			_this.structureDescription.outerElement[ 0 ].center.y = Number( val/2 );
			_this.structureDescription.outerElement[ 1 ].center.y = - Number( val/2 );
			_this.structureDescription.outerElement[ 2 ].length = Number( val );
			_this.structureDescription.outerElement[ 3 ].length = Number( val );

			_this.structureDescription.middleElement[ 0 ].length = Number( val );

			_this.structureWindowsDescription.panels[ 0 ].leftTop.y = Number( val/2 );
			_this.structureWindowsDescription.panels[ 0 ].rightBottom.y = - Number( val/2 );
			_this.structureWindowsDescription.panels[ 1 ].leftTop.y = Number( val/2 );
			_this.structureWindowsDescription.panels[ 1 ].rightBottom.y = - Number( val/2 );

		}

		//console.log( nodesH, nodesV );

		_this.reloadEditorScene();

	}


}

Viewer.prototype.reloadEditorScene = function(){

	var _this = this;

	this.scene.remove( this.profilesLayer );

	this.scene.remove( this.panelsLayer );

	this.scene.remove( this.dimensionChain );

	this.scene.remove( this.surfaceLoadLayer );

	this.profilesLayer = undefined;

	this.panelsLayer = undefined;

	this.dimensionChain = undefined;

	this.surfaceLoadLayer = undefined;

	this.createDesignScene();

}

Viewer.prototype.createDimensionChain = function() {

	var _this = this;

	this.dimensionChain = new THREE.Object3D();


	var dimLineVerticalHeight = nodesH[ 0 ].y + 50;

	var dimLineHorizontalHeight = Math.abs( nodesV[ 0 ].x ) + 50;

	var dimLineOverallHeight = nodesH[ 0 ].y + 100;

	var labelOffsetV = 20;

	var vertLineObjSpacing = 10;
	var vertLineExtensionStrokeLength = 60;

	var horizontalDimChain = createHorizontalDimChain();

	this.dimensionChain.add( horizontalDimChain );

	var verticalDimChain = createVerticalDimChain( nodesV );

	this.dimensionChain.add( verticalDimChain );

	var overallDimension = createOverallDimension();

	this.dimensionChain.add( overallDimension );

	function createOverallDimension(){

		var dimensionChain = new THREE.Object3D();

		//for ( var i = 0; i < nodesH.length - 1; i++ ) {

		var startX = nodesH[ 0 ].x,
			endX = nodesH[ 2 ].x,
			startY = nodesH[ 0 ].y,
			endY = nodesH[ 2 ].y;

			var posX = interpolateValue( startX, endX, 0.5 );

			var dimension = Math.abs( endX - startX );

			var text = dimension;

			var dimLabel = createLabelDimension( new THREE.Vector3( posX, dimLineOverallHeight + labelOffsetV, 0 ), text, new THREE.Vector3() );

			dimLabel.nodeID = -1;

			dimLabel.type = 'dimension';

			dimLabel.orientation = 'horizontal';

			_this.editableElements.push( dimLabel );

			var dimVertLine = makeDistanceLine(
				[   new THREE.Vector3( startX, startY + vertLineObjSpacing + 50, 0 ),
					new THREE.Vector3( startX, startY + vertLineExtensionStrokeLength + 50, 0 ),
				],
				viewerSettings.dim.lineColor
			);


			var arrowhead1 = make3DObject( "arrowHead", 0, 30 );
			arrowhead1.position.setX( startX );
			arrowhead1.position.setY( dimLineOverallHeight );
			arrowhead1.rotation.z = - Math.PI / 2;
			arrowhead1.material.color.set( viewerSettings.dim.lineColor );

			var arrowhead2 = arrowhead1.clone();
			arrowhead2.rotation.z -= Math.PI;
			arrowhead2.position.setX( endX );
			arrowhead2.material.color.set( viewerSettings.dim.lineColor );


			dimensionChain.add( dimLabel );

			dimensionChain.add( dimVertLine );

			dimensionChain.add( arrowhead1 );

			dimensionChain.add( arrowhead2 );

		//}

		var dimVertLine2 = makeDistanceLine(
			[   new THREE.Vector3( endX, endY + vertLineObjSpacing + 50, 0 ),
				new THREE.Vector3( endX, endY + vertLineExtensionStrokeLength + 50, 0 ),
			],
			viewerSettings.dim.lineColor );

		dimensionChain.add( dimVertLine2 );

		// horizontal length line

		var start = startX;
		var end = endX;
		var beamLengthStartV3 = new THREE.Vector3( start, dimLineOverallHeight, 0 );
		var beamLengthEndV3 = new THREE.Vector3( end, dimLineOverallHeight, 0 );
		var lineVectors = [ beamLengthStartV3, beamLengthEndV3 ];

		var lengthLine = makeDistanceLine( lineVectors, viewerSettings.dim.lineColor );
		dimensionChain.add( lengthLine );

		return dimensionChain;

	}

	function createHorizontalDimChain(){

		var dimensionChain = new THREE.Object3D();

		for ( var i = 0; i < nodesH.length - 1; i++ ) {

			var posX = interpolateValue( nodesH[ i ].x, nodesH[ i + 1 ].x, 0.5 );

			var dimension = Math.abs( nodesH[ i + 1 ].x - nodesH[ i ].x );

			var text = dimension;

			var dimLabel = createLabelDimension( new THREE.Vector3( posX, dimLineVerticalHeight + labelOffsetV, 0 ), text, new THREE.Vector3() );

			dimLabel.nodeID = i;

			dimLabel.type = 'dimension';

			dimLabel.orientation = 'horizontal';

			_this.editableElements.push( dimLabel );

			var dimVertLine = makeDistanceLine(
				[   new THREE.Vector3( nodesH[ i ].x, nodesH[ i ].y + vertLineObjSpacing, 0 ),
					new THREE.Vector3( nodesH[ i ].x, nodesH[ i ].y + vertLineExtensionStrokeLength, 0 ),
				],
				viewerSettings.dim.lineColor
			);


			var arrowhead1 = make3DObject( "arrowHead", 0, 30 );
			arrowhead1.position.setX( nodesH[ i ].x );
			arrowhead1.position.setY( dimLineVerticalHeight );
			arrowhead1.rotation.z = - Math.PI / 2;
			arrowhead1.material.color.set( viewerSettings.dim.lineColor );

			var arrowhead2 = arrowhead1.clone();
			arrowhead2.rotation.z -= Math.PI;
			arrowhead2.position.setX( nodesH[ i + 1 ].x );
			arrowhead2.material.color.set( viewerSettings.dim.lineColor );


			dimensionChain.add( dimLabel );

			dimensionChain.add( dimVertLine );

			dimensionChain.add( arrowhead1 );

			dimensionChain.add( arrowhead2 );

		}

		var dimVertLine = makeDistanceLine(
			[   new THREE.Vector3( nodesH[ nodesH.length - 1 ].x, nodesH[ nodesH.length - 1 ].y + vertLineObjSpacing, 0 ),
				new THREE.Vector3( nodesH[ nodesH.length - 1 ].x, nodesH[ nodesH.length - 1 ].y + vertLineExtensionStrokeLength, 0 ),
			],
			viewerSettings.dim.lineColor );

		dimensionChain.add( dimVertLine );

		// horizontal length line

		var start = nodesH[ 0 ].x;
		var end = nodesH[ nodesH.length - 1 ].x;
		var beamLengthStartV3 = new THREE.Vector3( start, dimLineVerticalHeight, 0 );
		var beamLengthEndV3 = new THREE.Vector3( end, dimLineVerticalHeight, 0 );
		var lineVectors = [ beamLengthStartV3, beamLengthEndV3 ];

		var lengthLine = makeDistanceLine( lineVectors, viewerSettings.dim.lineColor );
		dimensionChain.add( lengthLine );

		return dimensionChain;

	}

	function createVerticalDimChain( nodes ){

		var dimensionChain = new THREE.Object3D();

		for ( var i = 0; i < nodes.length - 1; i++ ) {

			var posX = interpolateValue( nodes[ i ].y, nodes[ i + 1 ].y, 0.5 );

			var dimension = Math.abs( nodes[ i + 1 ].y - nodes[ i ].y );

			var text = dimension;

			var dimLabel = createLabelDimension( new THREE.Vector3( posX, dimLineHorizontalHeight + labelOffsetV, 0 ), text, new THREE.Vector3() );

			dimLabel.nodeID = i;

			dimLabel.type = 'dimension';

			dimLabel.orientation = 'vertical';

			_this.editableElements.push( dimLabel );

			var dimVertLine = makeDistanceLine(
				[   new THREE.Vector3( nodes[ i ].y, Math.abs( nodes[ i ].x ) + vertLineObjSpacing, 0 ),
					new THREE.Vector3( nodes[ i ].y, Math.abs( nodes[ i ].x ) + vertLineExtensionStrokeLength, 0 ),
				],
				viewerSettings.dim.lineColor
			);


			var arrowhead1 = make3DObject( "arrowHead", 0, 30 );
			arrowhead1.position.setX( nodes[ i ].y );
			arrowhead1.position.setY( dimLineHorizontalHeight );
			arrowhead1.rotation.z = Math.PI / 2;
			arrowhead1.material.color.set( viewerSettings.dim.lineColor );

			var arrowhead2 = arrowhead1.clone();
			arrowhead2.position.setX( nodes[ i + 1 ].y );
			arrowhead2.rotation.z = - Math.PI / 2;

			arrowhead2.material.color.set( viewerSettings.dim.lineColor );


			dimensionChain.add( dimLabel );

			dimensionChain.add( dimVertLine );

			dimensionChain.add( arrowhead1 );

			dimensionChain.add( arrowhead2 );

		}

		var dimVertLine = makeDistanceLine(
			[   new THREE.Vector3( nodes[ nodes.length - 1 ].y, Math.abs( nodes[ nodes.length - 1 ].x ) + vertLineObjSpacing, 0 ),
				new THREE.Vector3( nodes[ nodes.length - 1 ].y, Math.abs( nodes[ nodes.length - 1 ].x ) + vertLineExtensionStrokeLength, 0 ),
			],
			viewerSettings.dim.lineColor );

		dimensionChain.add( dimVertLine );

		// horizontal length line

		var start = nodes[ 0 ].y;
		var end = nodes[ nodes.length - 1 ].y;
		var beamLengthStartV3 = new THREE.Vector3( start, dimLineHorizontalHeight, 0 );
		var beamLengthEndV3 = new THREE.Vector3( end, dimLineHorizontalHeight, 0 );
		var lineVectors = [ beamLengthStartV3, beamLengthEndV3 ];

		var lengthLine = makeDistanceLine( lineVectors, viewerSettings.dim.lineColor );
		dimensionChain.add( lengthLine );

		dimensionChain.rotation.z = Math.PI / 2;

		return dimensionChain;

	}

	//_this.animatorComponent.scene.add( dimensionChain );

	return this.dimensionChain;

}

Viewer.prototype.createSurfaceLoadLayer = function(){

	var _this = this;

	var layer = new THREE.Object3D();

	for ( var i = 0; i < this.structureWindowsDescription.panels.length; i++ ){
	//for ( var i = 0; i < 1; i++ ){

		var panel = _this.structureWindowsDescription.panels[ i ];

		var force = _this.structureWindowsDescription.panels[ i ].surfaceLoad;

		var presenrationInstance = createPresentationInstance( panel.leftTop, panel.rightBottom, force );

		layer.add( presenrationInstance );

	}

	function createPresentationInstance( leftTop, rightBottom, force ){

		var model = new THREE.Object3D();

		var dir = new THREE.Vector3(0,0,-1);

		var offsetFromWindow = 17,
			density = 50;

		var origin = new THREE.Vector3();

		//scale( valueIn, baseMin, baseMax, limitMin, limitMax )

		var arrowLength = scale( force, 0, 6000, 30, 300 );

		var hexColor = 0x0000ff;

		var headLength = 15;
		var headWidth = 5;

		origin.z = arrowLength + offsetFromWindow;

		function makeRowArrow( start, end, length ){

			var row = new THREE.Object3D();

			var num = 10; //Math.floor( length * density );

			var delta = new THREE.Vector2( ( end.x - start.x ) / 10, ( end.y - start.y ) / 10 );

			for ( var i = 0; i <= num; i++ ){

				var pos = new THREE.Vector2();

				pos.x = start.x + delta.x * i;
				pos.y = start.y + delta.y * i;

				origin.x = pos.x;
				origin.y = pos.y;

				var arrow = new THREE.ArrowHelper( dir, origin, arrowLength, hexColor, headLength, headWidth );

				row.add( arrow );

			}

			var baselineStart = new THREE.Vector3( start.x, start.y, origin.z ),
				baselineEnd = new THREE.Vector3( end.x, end.y, origin.z );

			var baseline = makeDistanceLine( [ baselineStart, baselineEnd ], hexColor );

			row.add( baseline );

			return row;

		}

		var rowStart = new THREE.Vector2( leftTop.x, leftTop.y ),
		    rowEnd = new THREE.Vector2( rightBottom.x, leftTop.y );
		var row1 = makeRowArrow( rowStart, rowEnd, rowEnd.x - rowStart.x );

		rowStart = new THREE.Vector2( leftTop.x, rightBottom.y );
		rowEnd = new THREE.Vector2( rightBottom.x, rightBottom.y );
		var row2 = makeRowArrow( rowStart, rowEnd, rowEnd.x - rowStart.x );

		rowStart = new THREE.Vector2( leftTop.x, leftTop.y );
		rowEnd = new THREE.Vector2( leftTop.x, rightBottom.y );
		var row3 = makeRowArrow( rowStart, rowEnd, rowEnd.x - rowStart.x );

		rowStart = new THREE.Vector2( rightBottom.x, leftTop.y );
		rowEnd = new THREE.Vector2( rightBottom.x, rightBottom.y );
		var row4 = makeRowArrow( rowStart, rowEnd, rowEnd.x - rowStart.x );

		var labelPos = new THREE.Vector3();
		labelPos.x = ( leftTop.x + rightBottom.x ) / 2;
		labelPos.y = leftTop.y;
		labelPos.z = origin.z;

		var labelText = " Fz=" + force + " ";
		var offset = new THREE.Vector3(100, 100, 50);

		var label = createLabel( labelPos, labelText, offset ); //createLabel( pos, value, offset )

		var leadOutStart = labelPos,
			leadOutEnd = new THREE.Vector3( label.position.x, label.position.y, label.position.z );

		var leadout = makeDistanceLine( [ leadOutStart, leadOutEnd ], 0x777777 );

		model.add( row1 );
		model.add( row2 );
		model.add( row3 );
		model.add( row4 );
		model.add( label );
		model.add( leadout );

		return model;
	}

	return layer;

}
