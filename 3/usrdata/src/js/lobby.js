
define([
    //charger les librairies
    'vendor/three.js/Three',
    'vendor/three.js/Detector',
    'vendor/three.js/Stats', 
    'vendor/threex/THREEx.screenshot',
    'vendor/threex/THREEx.FullScreen',
    'vendor/threex/THREEx.WindowResize',
    'vendor/threex.dragpancontrols',
    'vendor/threex/THREEx.KeyboardState'

  
], function() {
        var bPause = false ;
  	var stats, scene, renderer, composer;
    	var camera, cameraControls;
        //
   	var raquetteIA
        var raquettePerso;
        
        var hitboxRP;
        var hitboxRIA;
        var normalPerso;
        var normalIA;
        
        var boolhitRP;
        var boolhitRIA;
        //
        var axe;
        var bordD,bordG,bordH,bordB;
        var plane;
        var posC;
        var choixCamera;
        var keyboard = new THREEx.KeyboardState();
        var pointsIA;
        var pointsPerso;
        /*  Toutes les variables en fonction de la balle    */
        var balle;
        var vectDirct;
        var rays = 
        [
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(1, 0, 1),
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(1, 0, -1),
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(-1, 0, -1),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(-1, 0, 1)
        ];
        var RayCaster ;
        /*  Liste d'objets qui pouront int√©rompre la balle */
        var listInterceptTerrain ;
        var listInterceptBarrieres;
        var listInterceptRaquettes;
        var listInterceptPoints;
        var listInterceptHitbox;
        //
        var Barr1;
        var Barr2;
        var Barr3;
        var Barr4;
        
        var inertie;
        //Jokers
        var listOfJoker;
        var idMaxJoker;
        //temps
        var clock ;
        var timeSpawn;
        
        //taille du terrain
        var maxLargeur; 
        var minLargeur;
        var maxLongueur; 
        var minLongueur;
        
        
        
        

/******************************* : INIT : ************************************/
    function initialize(){
    if( Detector.webgl ){
            renderer = new THREE.WebGLRenderer({
                    antialias		: true,	// to get smoother output
                    preserveDrawingBuffer	: true	// to allow screenshot
            });
            renderer.setClearColor( 0xbbbbbb );
    }else{
            Detector.addGetWebGLMessage();
            return true;
    }
    
    //mise a jour de l'horloge
    clock = new THREE.Clock();
    clock.start();
    timeSpawn = 8;
    //mise en place de la taille du renderer
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container').appendChild(renderer.domElement);
    
    // add Stats.js
    stats = new Stats();
    stats.domElement.style.position	= 'absolute';
    stats.domElement.style.bottom	= '0px';

    document.body.appendChild( stats.domElement );

    // create a scene
    scene = new THREE.Scene();

    // put a camera in the scene
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 3, 15);
    

    scene.add(camera);

    //camera de rotation 
    //cameraControls= new THREEx.DragPanControls(camera);

    // transparently support window resize
    THREEx.WindowResize.bind(renderer, camera);
    // allow 'p' to make screenshot
    THREEx.Screenshot.bindKey(renderer);
    // allow 'f' to go fullscreen where this feature is supported
    if( THREEx.FullScreen.available() ){
    THREEx.FullScreen.bindKey();		
    document.getElementById('inlineDoc').innerHTML	+= "- <i>f</i> for fullscreen";
    document.getElementById('inlineDoc').innerHTML	+= "</br>- <i>p</i> for screenshot";
    }
/*
    //cr√©ation d'une aide pour l'axe
    axe = new THREE.AxisHelper(1);
    axe.position.y=1;
    scene.add( axe );

*/


    //cr√©ation de la lumi√®re 
    var light = new THREE.DirectionalLight( 0xaabbff, 0.3 );
    light.position.x = 0;//300;
    light.position.y = 0;//250;
    light.position.z = 0;//-500;
    scene.add( light );

    
    //cr√©ation du ciel
    var vertexShader = document.getElementById( 'vertexShader' ).textContent;
    var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
    var uniforms = {
            topColor: 	 { type: "c", value: new THREE.Color( 0x0000CC)},//0x0077ff ) },
            bottomColor: { type: "c", value: new THREE.Color(0xffffff)},// 0xffffff ) },
            offset:		 { type: "f", value: 400 },
            exponent:	 { type: "f", value: 0.6 }
    };
    uniforms.topColor.value.copy( light.color );
    var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
    var skyMat = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.BackSide
    } );
    var sky = new THREE.Mesh( skyGeo, skyMat );
    scene.add( sky );

    //Cr√©ation du plateau de jeu

    var geometry = new THREE.PlaneGeometry(13.5,21);
    var material = new THREE.MeshBasicMaterial( {color: 0x2C564E, side: THREE.DoubleSide} );
    plane = new THREE.Mesh( geometry, material );
    plane.position.set( 0, -0.251, 0);
    var degre = 90 * Math.PI/180;
    plane.rotateX(degre);
    scene.add( plane );

    //cr√©ation du bord du plateau
    /*  Bord gauche du plateau de jeu */
    var geometry = new THREE.BoxGeometry( 2, 0.5, 20);
    var material = new THREE.MeshBasicMaterial( { color: Math.random()* 0xffffff } );//{ map : texture});//);
    bordG = new THREE.Mesh( geometry, material );   
    bordG.position.x = -5.8;

    scene.add( bordG );
    /*  Bord droit du plateau de jeu */
    bordD = new THREE.Mesh( geometry, material );
    bordD.position.x = 5.8;
    scene.add( bordD );
    /*  Bord haut du plateau de jeu */
    var geometry = new THREE.BoxGeometry( 13.5, 0.5, 0.5 );
    var material = new THREE.MeshBasicMaterial( { color: Math.random()* 0xffffff } );//{ map : texture});//);
    bordH = new THREE.Mesh( geometry, material );
    bordH.position.z = -10.25;
    bordH.id = 10;
    scene.add( bordH );
    /*  Bord bas du plateau de jeu */
    bordB = new THREE.Mesh( geometry, material );
    bordB.position.z = 10.25;
    bordB.id = 11;
    scene.add( bordB );

    // taille du terrain (pour les jokers) 
    maxLargeur = 3.4; 
    minLargeur = -3.4;
    maxLongueur = +8; 
    minLongueur = -8;

    //init liste des jokers
    listOfJoker=[];
    idMaxJoker=50;
    
    
    //hitbox
    var hitboxRP;
    var hitboxRIA;
    var geometry = new THREE.SphereGeometry( 2,20,20  );
    var material = new THREE.MeshBasicMaterial( { color: Math.random()* 0xffffff ,transparent:true, opacity:0.3 });//{ map : texture});//);
    hitboxRP = new THREE.Mesh( geometry, material );
    hitboxRIA = new THREE.Mesh( geometry, material );
    hitboxRP.id = 3;    
    hitboxRIA.id = 4;    
    boolhitRP=false;
    boolhitRIA=false;
    /*
    normalPerso=new THREE.Vector3(0,0,0);
    normalIA=new THREE.Vector3(0,0,0);
   */ 
    //Cr√©ation des raquettes  
    //var texture = new THREE.TextureLoader().load('./test.jpg');
    var geometry = new THREE.BoxGeometry( 2, 0.5, 0.5 );
    var material = new THREE.MeshBasicMaterial( { color: Math.random()* 0xffffff } );//{ map : texture});//);
    raquettePerso = new THREE.Mesh( geometry, material );
    raquettePerso.position.z = 8;
    raquettePerso.id = 1;
    raquettePerso.precision = "highp";
    raquettePerso.add(hitboxRP);
   

    scene.add( raquettePerso );

    raquetteIA  =new THREE.Mesh( geometry, material );
    raquetteIA.position.z=-8;
    raquetteIA.id = 2;
    raquetteIA.precision = "highp";
    raquetteIA.add(hitboxRIA);
    scene.add( raquetteIA );   


    listInterceptHitbox=[hitboxRIA,hitboxRP];
    //cr√©ation de la balle
    var geometry = new THREE.SphereGeometry( 0.2, 0.2, 0.2 );
    var material = new THREE.MeshBasicMaterial( { color: Math.random()* 0xffffff } );//{ map : texture});//);
    balle = new THREE.Mesh( geometry, material );
    scene.add( balle );

    //lancement du raycaster pour la collision de la balle
    RayCaster = new THREE.Raycaster();
    vectDirct = new THREE.Vector3(0,0,0.1);

    //tableau de collision
    listInterceptTerrain = [bordD,bordG];
    listInterceptRaquettes = [raquettePerso,raquetteIA];
    listInterceptPoints = [bordH,bordB];
    
    //Gestion de la camera
    posC = new THREE.Vector3(0,0,0);
    posC = raquettePerso.position.clone();
    choixCamera=1;
    
    
    //crÈation des barriËres

    //b1
    var geometry = new THREE.BoxGeometry( 4.3, 0.5, 0.1 );
    var material = new THREE.MeshBasicMaterial( { color: 0xccfffd,transparent:true,opacity:0.33} );
    Barr1 = new THREE.Mesh(geometry,material);
    Barr1.position.x = -2.2;
    Barr1.position.z = 9.3;
    Barr1.id = 31;
    scene.add(Barr1);
    
    //b2
    var geometry = new THREE.BoxGeometry( 4.3, 0.5, 0.1 );
    var material = new THREE.MeshBasicMaterial( { color: 0xccfffd,transparent:true ,opacity:0.33} );
    Barr2 = new THREE.Mesh(geometry,material);
    Barr2.position.x = 2.2;
    Barr2.position.z = 9.3;
    Barr2.id = 32;
    scene.add(Barr2);
    
    //b3
    var geometry = new THREE.BoxGeometry( 4.3, 0.5, 0.1 );
    var material = new THREE.MeshBasicMaterial( { color: 0xccfffd,transparent:true,opacity:0.33} );
    Barr3 = new THREE.Mesh(geometry,material);
    Barr3.position.x = -2.2;
    Barr3.position.z = -9.3;
    Barr3.id = 33;
    scene.add(Barr3);
    
    
    //b4
    var geometry = new THREE.BoxGeometry( 4.3, 0.5, 0.1 );
    var material = new THREE.MeshBasicMaterial( { color: 0xccfffd,transparent:true,opacity:0.33} );
    Barr4 = new THREE.Mesh(geometry,material);
    Barr4.position.x = 2.2;
    Barr4.position.z = -9.3;
    Barr4.id = 34;
    scene.add(Barr4);
    
    //ajout des barriËres dans la liste de collision
    listInterceptBarrieres = [Barr1,Barr2,Barr3,Barr4];
    listInitBarrieres = [Barr1,Barr2,Barr3,Barr4];
    
    
    //Gestion des points
    pointsIA=0;
    pointsPerso=0;
    
    //
    inertie=0;
    
    //
    var param=document.getElementById("ParamPartie").setAttribute("style", "display:none");
    
    window.addEventListener("keydown",pause,false);

    }

/******************************* : Pause : ************************************/
    function pause() {
    if ( keyboard.pressed("W"))
    {
        if(bPause==false)
        {
            bPause=true;
        }else{
            bPause= false;
        }
    }
 
    }



/******************************* : ANIMAT : ************************************/
    function animate() {
    stats.begin();
    // do the render
    render();
    if(bPause==false)
    {
        update();
    }
    // update stats
    stats.end();
    
    requestAnimationFrame( animate );
    }

   
 
/******************************* : PBALLE : ************************************/
    
/*
 * Detecter si la position de la balle au pas de temps 
 * suivant est ‡ l'intÈrieur de la raquette
 * 
 */
    function pBalle(posBal,obj)
    {


        if((boolhitRP === true)||(boolhitRIA === true))
        {
                if(
                    (posBal.x <= (obj.position.x+1.25)) && 
                    (posBal.x >= (obj.position.x-1.25)) && 
                    (posBal.z <= (obj.position.z+0.5))&&
                    (posBal.z >= (obj.position.z-0.5))
                               
                ){
                    boolhitRP =false;
                    boolhitRIA=false;
                    return true;
                }
                else{
                    return false;
                }
       }else{
           return false;
       }

        
    }
/******************************* : UPDATE : ************************************/
    function update()
    {    
            
            if ( keyboard.pressed("A")) //d√©placement max de la raquette 
            {
                
                if((raquettePerso.position.x - inertie )> -3.4)
                {
                    raquettePerso.translateX( -0.05 + inertie );
                    if(inertie>-0.1)
                    {
                        inertie -=0.01;
                    }
                }
            }else{ if ( keyboard.pressed("Z") )  //d√©placement max de la raquette 
                {
                    if((raquettePerso.position.x + inertie )< 3.4)
                    {
                        raquettePerso.translateX(  0.05 + inertie );
                        if(inertie<0.1)
                        {
                            inertie +=0.01;
                        }
                    }
                }else{
                    //pas de mouvement
                    inertie=0;
                }
            }
            if( keyboard.pressed("1"))
            {
                choixCamera=1;
            }
            if( keyboard.pressed("2"))
            {
                choixCamera=2;
            }
            if( keyboard.pressed("3"))
            {
                choixCamera=3;
            }
            if( keyboard.pressed("4"))
            {
                choixCamera=4;
            }

            if(!collisionBalle())
            {
                
              //calcul de la position de la balle ‡ la frame suivante
              var posBalle = balle.position.clone();
              posBalle.x += vectDirct.x;
              posBalle.z += vectDirct.z;
              
              
              //dÈtecter la collision avec la position calculÈe
              if(pBalle(posBalle,raquetteIA))
              { 
                  var normale = new THREE.Vector3(0,0,-1);
                  vectDirct.reflect(normale);
                  if(balle.position.x > raquetteIA.position.x)
                    { //a gauche de la raquette
                      //si la balle est deja ‡ l'intÈrieur de la raquette
                      //alors on oblige sa position a etre ‡ l'extÈrieure
                      if(pBalle(balle.position,raquetteIA))
                      {
                        balle.position.x=raquetteIA.position.x +1.25;
                        balle.position.z=raquetteIA.position.z +0.5;
                      }
                    }else{
                      if(pBalle(balle.position,raquetteIA))
                      {
                        balle.position.x=raquetteIA.position.x -1.25;
                        balle.position.z=raquetteIA.position.z +0.5;
                      }
                    }
                  //savoir si on est ‡ gauche ou a droite de la raquette
                  balle.translateX(vectDirct.getComponent(0));
                  balle.translateY(vectDirct.getComponent(1));
                  balle.translateZ(vectDirct.getComponent(2));
                  
              }else{
                if(pBalle(posBalle,raquettePerso))
                { 
                    var normale = new THREE.Vector3(0,0,1);
                    vectDirct.reflect(normale);
                    //savoir si on est ‡ gauche ou a droite de la raquette
                        if(balle.position.x > raquettePerso.position.x)
                        { 
                          //si la balle est deja ‡ l'intÈrieur de la raquette
                          //alors on oblige sa position a etre ‡ l'extÈrieure
                          if(pBalle(balle.position,raquettePerso))
                          {
                            balle.position.x=raquettePerso.position.x +1.25;
                            balle.position.z=raquettePerso.position.z -0.5;
                          }
                        }else{
                          if(pBalle(balle.position,raquettePerso))
                          {
                            balle.position.x=raquettePerso.position.x -1.25;
                            balle.position.z=raquettePerso.position.z -0.5;
                          }
                        }      
                    balle.translateX(vectDirct.getComponent(0));
                    balle.translateY(vectDirct.getComponent(1));
                    balle.translateZ(vectDirct.getComponent(2));
                    
                }else{//si pas de collision alors on fait rien
                    balle.translateX(vectDirct.getComponent(0));
                    balle.translateY(vectDirct.getComponent(1));
                    balle.translateZ(vectDirct.getComponent(2));

                }
              }
       
                    
            }
            IA();
            //ajouter les jokers 
            //gerrer le temps

            if(clock.getElapsedTime() > timeSpawn)
            {
                timeSpawn += 8;   
                addJoker();
            }
            
        
            positionCamera(choixCamera);
            camera.lookAt(posC);
    }
/******************************* :     IA    : ************************************/
    function IA(){
        if(balle.position.x > raquetteIA.position.x)
        {
                if(raquetteIA.position.x < 3.5)
                {
                     raquetteIA.translateX( 0.05 );
                }
        }
        if(balle.position.x < raquetteIA.position.x)
        {
                if(raquetteIA.position.x > -3.5)
                {
                     raquetteIA.translateX( -0.05 );
                }
        }
    }
        
    
/******************************* : Jokers : *********************************/  
    function addJoker()
    {
        //cr√©ation de la balle
        var geometry = new THREE.SphereGeometry( 0.2, 0.2, 0.2 );
        var material = new THREE.MeshBasicMaterial( { color: Math.random()* 0xffffff } );//{ map : texture});//);
        var joker = new THREE.Mesh( geometry, material );
        var x = (Math.random() * (2*maxLargeur)) + 1;
        var y = 0;
        var z= (Math.random() * (2*maxLongueur)) + 1;  
        if(x > maxLargeur)
        {
            x = x/2;
            x = -x;
        }
        if(z > maxLongueur)
        {
            z = z/2;
            z = -z;
        }
        joker.position.x = x;
        joker.position.z = z;
        joker.position.y = y;
        idMaxJoker++;
        joker.id = idMaxJoker;
        scene.add( joker );
        listOfJoker.push(joker);    
    }

/******************************* : Collision : *********************************/       

    function collisionBalle(){
        var collisions= null;

        for(var i=0;i<rays.length;i++)
        {       
            //collision de la balle avec les bords droit et gauche du terrain 
            RayCaster.far =0.30;
            RayCaster.near =0.1;
            RayCaster.linePrecision = "highp";
            RayCaster.set(balle.position, rays[i]);
            collisions = RayCaster.intersectObjects(listInterceptTerrain);  
            if(collisions.length>0)
            {   
                
                vectDirct.reflect(collisions[0].face.normal);
                //cap la vitesse
                vitesseMaxBalle();
                balle.translateX(vectDirct.getComponent(0));
                balle.translateY(vectDirct.getComponent(1));
                balle.translateZ(vectDirct.getComponent(2));

                return true;

            }
            
            
            //collision de la balle avec les raquettes
            collisions = RayCaster.intersectObjects(listInterceptRaquettes);  
            if(collisions.length>0)
            {
                if(collisions[0].distance <=0.2)
                {
                  // console.log(collisions[0].face.normal);
                }
                vectDirct.reflect(collisions[0].face.normal);
                if(collisions[0].object.id===1 && inertie!=0)
                {
                    vectDirct.x += inertie;
                }
             
               
                normalPerso=null;
                normalIA=null;
                boolhitRP =false;
                boolhitRIA =false;
                
                if(balle.position.x > raquettePerso.position.x)
                { //on tape sur le cotÈ droit de la raquette
                    vectDirct.x += 0.03;
                }else{
                    if(balle.position.x < raquettePerso.position.x)
                    { //on tape sur le cotÈ gauche de la raquette
                        vectDirct.x -= 0.03;
                    }else{
                        //la position de la balle est Ègale au centre de la raquette
                       //on ajoute rien 
                    }
                }
                
                    
                
                
                //cap la vitesse
                vitesseMaxBalle();
                balle.translateX(vectDirct.getComponent(0));
                balle.translateY(vectDirct.getComponent(1));
                balle.translateZ(vectDirct.getComponent(2));
                return true;
            } 
            
            //collision de la balle avec les barriËres
            collisions = RayCaster.intersectObjects(listInterceptBarrieres);  
            if(collisions.length>0)
            {   
                for(var i = 0 ;i<listInterceptBarrieres.length;i++)
                {
                    //on recherche la surface pour la supprimer de la scene
                    if(listInterceptBarrieres[i].id === collisions[0].object.id)
                    {
                     scene.remove(listInterceptBarrieres[i]);   
                     listInterceptBarrieres.splice(i,i+1);   
                    }
                }
               
                vectDirct.reflect(collisions[0].face.normal);
                //cap la vitesse
                vitesseMaxBalle();
                balle.translateX(vectDirct.getComponent(0));
                balle.translateY(vectDirct.getComponent(1));
                balle.translateZ(vectDirct.getComponent(2));

                return true;
                
            }
            
            
            
             //collision les hitboxs
            collisions = RayCaster.intersectObjects(listInterceptHitbox);  
            if(collisions.length>0)
            {   
                if(collisions[0].object.id === 3)
                {
                    boolhitRP = true;
                    normalPerso =  collisions[0].face.normal.clone();
                    
                }else{
                    boolhitRIA = true;
                    normalIA =  collisions[0].face.normal.clone();
                }  
                
                balle.translateX(vectDirct.getComponent(0));
                balle.translateY(vectDirct.getComponent(1));
                balle.translateZ(vectDirct.getComponent(2));
            }
            
       
            
            //collision de la balle avec les bords hauts et bas du terrain
            collisions = RayCaster.intersectObjects(listInterceptPoints);  
            if(collisions.length>0)
            {                
                if(collisions[0].object.id ===10)
                {
                    pointsPerso += 1;
                    var domScore = document.getElementById("dScore");
                    domScore.innerHTML = pointsPerso;
                    alert("vous avez marquÈ !"); 
                }else{
                    pointsIA += 1;
                }
                balle.position.x=0;
                balle.position.y=0;
                balle.position.z=0;
                //la direction de la balle est nÈgation de normale ‡ la surface du joueur qui a perdu 
                vectDirct = collisions[0].face.normal.clone();
                vectDirct.negate();
                vectDirct.x /= 10;
                vectDirct.y /= 10;
                vectDirct.z /= 10;
                for(var i in listInitBarrieres )
                {
                    listInterceptBarrieres[i] = listInitBarrieres[i];
                    scene.add(listInterceptBarrieres[i]);
                }  
                return true;      
            }
            
            collisions = RayCaster.intersectObjects(listOfJoker);  
            if(collisions.length>0)
            { 
                //parcours de la liste des jokers 
                for(var i in listOfJoker)
                {
                    if(collisions[0].object.id === listOfJoker[i].id )
                    {
                        scene.remove(listOfJoker[i]);   
                    }   
                }
                balle.translateX(vectDirct.getComponent(0));
                balle.translateY(vectDirct.getComponent(1));
                balle.translateZ(vectDirct.getComponent(2));
                return true; 
            } 
            
        }
        return false;

    }
    
    
   
/*************************** : BALLEVITESSE : **********************************/        
    function vitesseMaxBalle(){
                //on ajoute une vitesse max au vecteur
            if(vectDirct.x>=0 && vectDirct.x>0.23)
            {
                vectDirct.x = 0.20;
            }
            if(vectDirct.x<=0 && vectDirct.x<-0.23)
            {
                vectDirct.x = -0.20;
            }
    }


/**************************** : CAMERA : ***************************************/        
    function positionCamera(pos)
    {

        switch(pos)
        {
            case 1:
                posC = raquettePerso.position.clone();
                camera.position.x = raquettePerso.position.x;
                camera.position.y = 3;
                camera.position.z = 15;
                
                
                break;
            case 2:
                posC = balle.position.clone();
                break;
            case 3:
                posC = plane.position.clone();   
                camera.position.x = 0;
                camera.position.y = 3;
                camera.position.z = 15;
                
                break;
            case 4:
                camera.position.z = 0;
                camera.position.y = 9;
                camera.position.x = 0;
                posC = plane.position.clone();
                break;

        }
    }
/******************************* : RENDER : ************************************/

	function render() {


	// update camera controls
	//cameraControls.update();

	// actually render the scene
	renderer.render( scene, camera );
        
	}
        
 /******************************************************************************/


    // On exporte la fonction initialize dans le module app.js
    return {
    	initialize : initialize,
        animate : animate,
        render : render
    
    };
 
});


/*  // si la hitbox a dÈtectÈ une collision 
            if(balle.position.x > raquettePerso.position.x)
            { //on tape sur le cotÈ droit de la raquette

                if(balle.position.z >= (raquettePerso.position.z-0.5))
                {
                    if(balle.position.x< (raquettePerso.position.x+1))
                    {
                        console.log("Interrieur !!");
                        normalPerso.y=0;
                        vectDirct.reflect(normalPerso);
                        balle.translateX(vectDirct.getComponent(0));
                        balle.translateY(vectDirct.getComponent(1));
                        balle.translateZ(vectDirct.getComponent(2));
                        normalPerso=null;
                        boolhitRP =false;
                    }

                }
                    balle.translateX(vectDirct.getComponent(0));
                    balle.translateY(vectDirct.getComponent(1));
                    balle.translateZ(vectDirct.getComponent(2));

            }else{
                if(balle.position.x < raquettePerso.position.x)
                { //on tape sur le cotÈ gauche de la raquette
                    if(balle.position.z >= (raquettePerso.position.z-0.5))
                     {
                        if(balle.position.x> (raquettePerso.position.x-1))
                        {
                            console.log("Interrieur !!");
                            normalPerso.y=0;
                            vectDirct.reflect(normalPerso);
                            balle.translateX(vectDirct.getComponent(0));
                            balle.translateY(vectDirct.getComponent(1));
                            balle.translateZ(vectDirct.getComponent(2));
                            normalPerso=null;
                            boolhitRP =false;
                        }

                     }
                    balle.translateX(vectDirct.getComponent(0));
                    balle.translateY(vectDirct.getComponent(1));
                    balle.translateZ(vectDirct.getComponent(2));

                }else{
                    balle.translateX(vectDirct.getComponent(0));
                    balle.translateY(vectDirct.getComponent(1));
                    balle.translateZ(vectDirct.getComponent(2));
                }
            }

        }
        else{
            if(boolhitRIA === true)
            {

                boolhitRIA=false;
            }else{
                balle.translateX(vectDirct.getComponent(0));
                balle.translateY(vectDirct.getComponent(1));
                balle.translateZ(vectDirct.getComponent(2));
            }
        }*/
