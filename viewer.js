/**
 * Created by Mika on 18/04/16.
 */

var viewer = new Viewer( "cad-view" );

viewer.Init();

function Viewer( divID ){

	var _this = this;

	this.Init = init;

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

		panels: [ { center: new THREE.Vector3(0,0,0), width: 300, height: 1000,
			leftTop: new THREE.Vector2( -500, 300 ), rightBottom: new THREE.Vector2( 0, - 300 ) },
					{ center: new THREE.Vector3(0,0,0), width: 300, height: 1000,
						leftTop: new THREE.Vector2( 0, 300 ), rightBottom: new THREE.Vector2( 500, - 300 ) }

		]

	}

	var editableElements = [];

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

			var pointLight1 = new THREE.PointLight( 0xffffff, 0.3 );
			pointLight1.position.set( 0, 5 * volumeScale, 10 * volumeScale );
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


		var mouse, raycaster;



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
			//
			//if ( !_this.loaderComponent ) return;
			//
			//updateMousePos( event );
			//
			//var all = _this.loaderComponent.gizmos.concat( _this.loaderComponent.sprites );
			//
			//var obj;
			//
			//
			////if ( ( obj = castRay( _this.loaderComponent.mainDimensionLine.children[ 1 ] ) ) != undefined ) {
			////
			////	console.log( "clicked", obj );
			////
			////}
			//
			//if ( ( obj = castRay( all ) ) != undefined ) {
			//	/*
			//	 -casts a ray and checks if it hit anything valid
			//	 -selects a valid gizmo
			//	 -prompts the user for a new position
			//	 -positions the selected gizmo to the new value
			//	 */
			//	_this.selectedGizmo = obj.object;
			//
			//
			//
			//	//if ( _this.selectedGizmo.type == "sprite" )
			//	//	_this.selectedGizmo = _this.selectedGizmo.parent.parent;
			//
			//
			//	// double click on main dimension line label
			//	if ( _this.selectedGizmo.type == "lengthSprite"
			//		|| _this.selectedGizmo.gizmoType == "dimension"
			//
			//	) {
			//
			//		//_this.loaderComponent.setBeamLength();
			//
			//		if ( _this.viewerComponent.onUserSelectBeamLength != undefined ){
			//
			//			_this.viewerComponent.onUserSelectBeamLength();
			//
			//		}else{
			//
			//			console.warn( "Callback function is not set" );
			//		}
			//
			//		onMouseUp();
			//		return;
			//
			//	}
			//
			//	if ( _this.selectedGizmo.gizmoType == "support" ) {
			//
			//		if ( _this.viewerComponent.onUserSelectSupport != undefined ){
			//
			//			_this.viewerComponent.onUserSelectSupport( _this.selectedGizmo.node.id );
			//
			//		}else{
			//
			//			console.warn( "Callback function is not set" );
			//		}
			//
			//	}
			//
			//	if ( _this.selectedGizmo.gizmoType == "loadPoint"
			//		|| _this.selectedGizmo.gizmoType == "distributed"
			//		|| _this.selectedGizmo.gizmoType == "bending"
			//	) {
			//
			//		if ( _this.viewerComponent.onUserSelectLoadPoint != undefined ){
			//
			//			_this.viewerComponent.onUserSelectLoadPoint( _this.selectedGizmo.parentNode.id );
			//
			//		}else{
			//
			//			console.warn( "Callback function is not set" );
			//		}
			//
			//	}
			//
			//	//var newX = prompt( "new position" );
			//	//
			//	//if ( newX != undefined || isNaN( newX ) ) {
			//	//
			//	//	_this.selectedGizmo.position.setX( -newX * _this.loaderComponent.beamScreenToUnitsRatio );
			//	//
			//	//}
			//
			//	onMouseUp();
			//
			//} else resetGizmoEmissive();
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

			var offset = _this.container.offset();
			mouse.x = ((event.clientX - (offset.left - window.scrollLeft())) / _this.width) * 2 - 1;
			mouse.y = -((event.clientY - (offset.top - window.scrollTop())) / _this.height) * 2 + 1;

		}

		function castRay( array ) {
			/*
			 -perform a raycast to an array received as an argument
			 -if a valid mesh is found, its returned. if not, return undefined
			 */
			//raycaster.setFromCamera( mouse, _this.camera );
			//var intersects = raycaster.intersectObjects( array, false );
			//if ( intersects[ 0 ] ) {
			//	toggleInput( false );
			//	return intersects[ 0 ];
			//} else return undefined;
		}

	}

	function createDesignScene(){

		createProfiles();

		createPanelElements();

		function createProfiles(){

			console.log( sideElementModel );

			console.log( structureDescription );


			var firstMeshSide =  sideElementModel.children[ 0 ];

			if ( firstMeshSide.geometry.boundingSphere === null ) firstMeshSide.geometry.computeBoundingSphere();

			console.log( firstMeshSide.geometry.boundingSphere.center );

			var shiftSideElement = firstMeshSide.geometry.boundingSphere.center;

			recalcuatePositions( sideElementModel, shiftSideElement );

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

			recalcuatePositions( middleElementModel, shiftMiddleElement );

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

				_this.scene.add( element );

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

				_this.scene.add( element );

			}

		}

		function createPanelElements(){


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

					_this.scene.add( panel );

				}

			}

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