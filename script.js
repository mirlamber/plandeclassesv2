let selected = null;
let currentStudentLabel = null;
let offsetX = 0;
let offsetY = 0;

let locked = false;
let students = [];
let lastAction = null;
const DEV_MODE = false;
let ignoreNextDrag = false;
let layoutPoints = {
    board: null,
    prof: null,
    lastDesk: null
};
let dragPlaceholder = null;

// activation déplacement
document.querySelectorAll(".element").forEach(makeDraggable);


function makeDraggable(element){

    element.addEventListener("mousedown", e => {

        if (locked) return;

        if (e.target.classList.contains("rotation-handle")) return;
        if (rotating) return;

        selected = element;

        let x = element.offsetLeft;
        let y = element.offsetTop;

        offsetX = e.clientX - x;
        offsetY = e.clientY - y;

        element.style.cursor = "grabbing";
    });

    addRotationHandle(element);

    // ✅ AJOUT ICI (IMPORTANT)
    addContextMenu(element);
}


function getComputedClassroomBounds() {

    let elements = document.querySelectorAll("#classroom .element");

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach(el => {

        let rect = el.getBoundingClientRect();

        if (rect.left < minX) minX = rect.left;
        if (rect.top < minY) minY = rect.top;
        if (rect.right > maxX) maxX = rect.right;
        if (rect.bottom > maxY) maxY = rect.bottom;

    });

    return { minX, minY, maxX, maxY };
}

document.addEventListener("mousemove", e => {

    // =====================
    // ROTATION PRIORITAIRE
    // =====================
    if (rotating) {

        let rect = rotating.getBoundingClientRect();

        let centerX = rect.left + rect.width / 2;
        let centerY = rect.top + rect.height / 2;

        let currentAngle = Math.atan2(
            e.clientY - centerY,
            e.clientX - centerX
        );

        let delta = currentAngle - startAngle;
        let degrees = delta * 180 / Math.PI;

        rotating.rotation = startRotation + degrees;
        rotating.style.transform = `rotate(${rotating.rotation}deg)`;

        return; // 👈 IMPORTANT : bloque le drag
    }

    // =====================
    // DRAG ELEMENTS (CORRIGÉ)
    // =====================
    if (selected) {
        const classroom = document.querySelector("#classroom");

        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        // Limites minimales
        const minX = 0;
        const minY = 0;

        // Limites maximales (Taille de la classe - Taille du bureau)
        const maxX = classroom.clientWidth - selected.offsetWidth;
        const maxY = classroom.clientHeight - selected.offsetHeight;

        // On bloque les coordonnées pour ne pas dépasser le cadre
        x = Math.max(minX, Math.min(x, maxX));
        y = Math.max(minY, Math.min(y, maxY));

        selected.style.left = x + "px";
        selected.style.top = y + "px";
    }
});





document.addEventListener("mouseup", () => {

    selected = null;
    rotating = null;

});






// AJOUT BUREAU


document.querySelector("#addDesk")

.onclick=function(){


    let desk =
    document.createElement("div");

    desk.style.transformOrigin = "center center";
    desk.rotation = 0;
    desk.className="element studentDesk";

    desk.innerHTML = `<div class="desk-label">Bureau</div>`;


    desk.style.left="100px";
    desk.style.top="100px";



    document.querySelector("#classroom")
    .appendChild(desk);



    makeDraggable(desk);



};






// VERROUILLAGE


document.querySelector("#lock")
.onclick=function(){


    locked=!locked;


    this.innerHTML =
    locked
    ? "🔓 Déverrouiller"
    : "🔒 Verrouiller";


};



// accroche temporaire


function snap(){


    let elements =
    document.querySelectorAll(".element");



    elements.forEach(other=>{


        if(other===selected) return;



        let distanceX =
        Math.abs(
            selected.offsetLeft -
            other.offsetLeft
        );


        let distanceY =
        Math.abs(
            selected.offsetTop -
            other.offsetTop
        );



        if(distanceX<20 && distanceY<20){


            selected.style.left =
            other.offsetLeft +
            other.offsetWidth +
            "px";


            selected.style.top =
            other.offsetTop+
            "px";


        }



    });



}
//rotation des bureaux

let rotating = null;

let startAngle = 0;

let startRotation = 0;



function addRotationHandle(element){

    let handle = document.createElement("div");
    handle.className = "rotation-handle";

    element.appendChild(handle);

    handle.addEventListener("mousedown", e => {

        // 🔒 blocage si verrouillé
        if (locked) return;

        e.stopPropagation();

        rotating = element;

        let rect = element.getBoundingClientRect();

        let centerX = rect.left + rect.width / 2;
        let centerY = rect.top + rect.height / 2;

        let mouseAngle = Math.atan2(
            e.clientY - centerY,
            e.clientX - centerX
        );

        startAngle = mouseAngle;
        startRotation = element.rotation || 0;

    });

}










document.addEventListener("mouseup",()=>{


    rotating=null;


});

// clic droit angle 0 et 90

let contextMenu = document.querySelector("#contextMenu");
let currentElement = null;


// clic droit sur les éléments
function addContextMenu(element){
    element.addEventListener("contextmenu", e => {
        e.preventDefault();

        currentElement = element;
        currentStudentLabel = null;

        // Masquer les boutons réservés aux étiquettes
        document.getElementById("editStudentLabel").style.display = "none";
        document.getElementById("deleteStudentLabel").style.display = "none";

        // Afficher les boutons pour les bureaux/éléments
        document.getElementById("deleteElement").style.display = "block";
        document.getElementById("colorRed").style.display = "block";
        document.getElementById("colorGreen").style.display = "block";
        document.getElementById("colorYellow").style.display = "block";
        document.getElementById("colorReset").style.display = "block";

        if (element.classList.contains("studentDesk")) {
            document.getElementById("toggleDeskText").style.display = "block";
            let removeBtn = document.getElementById("removeStudent");
            removeBtn.style.display = element.assignedStudent ? "block" : "none";
        } else {
            document.getElementById("removeStudent").style.display = "none";
            document.getElementById("toggleDeskText").style.display = "none";
        }

        contextMenu.style.display = "block";
        contextMenu.style.left = e.pageX + "px";
        contextMenu.style.top = e.pageY + "px";
    });
}


//retrier 
document.getElementById("removeStudent").onclick = function () {

    if (!currentElement) return;

    let desk = currentElement;
    let student = desk.assignedStudent;


    // 1. remettre l'élève dans la liste des non affectés
    document.getElementById("unassignedZone").appendChild(student);
    student.style.position = "static";

    // 2. libérer le bureau
    desk.assignedStudent = null;

    // 3. remettre le label du bureau (sans casser les enfants comme le handle)
    let label = desk.querySelector(".desk-label");
    if (label) {
        label.textContent = "Bureau";
    }

    // 4. fermer le menu
    contextMenu.style.display = "none";

    // reset de l etiquette
    resetStudentToList(student);
};


// appliquer à tous les éléments existants
document.querySelectorAll(".element").forEach(addContextMenu);

// Gestion de la suppression via le clic droit
document.getElementById("deleteElement").onclick = function () {
    if (!currentElement) return;

    // Si l'élément est un bureau et qu'un élève y est installé
    if (currentElement.assignedStudent) {
        // On renvoie l'élève dans la liste des non-affectés
        resetStudentToList(currentElement.assignedStudent);
        currentElement.assignedStudent = null;
    }

    // On supprime l'élément (bureau, tableau ou prof) du plan de classe
    currentElement.remove();

    // On cache le menu
    contextMenu.style.display = "none";
    currentElement = null;
};

// Inverser le texte du bureau sélectionné au clic droit
document.getElementById("toggleDeskText").onclick = function() {
    if (!currentElement) return;

    // On vérifie que c'est bien un bureau d'élève
    if (currentElement.classList.contains("studentDesk")) {
        // .toggle() ajoute la classe si elle n'y est pas, et la retire si elle y est
        currentElement.classList.toggle("text-flipped");
    }

    // On cache le menu après l'action
    contextMenu.style.display = "none";
    currentElement = null;
};

// 0°
//document.querySelector("#rot0").onclick = function () {
//
//    if (!currentElement) return;
//
//    currentElement.rotation = 0;
//    currentElement.style.transform = `rotate(0deg)`;
//
//   contextMenu.style.display = "none";
//};


// 90°
//document.querySelector("#rot90").onclick = function () {
//
//    if (!currentElement) return;
//
//    currentElement.rotation = 90;
//    currentElement.style.transform = `rotate(90deg)`;
//
//    contextMenu.style.display = "none";
//};

////document.querySelector("#rotMinus90").onclick = function () {
//
//    if (!currentElement) return;
//
//    currentElement.rotation = -90;
//    currentElement.style.transform = `rotate(-90deg)`;

////    contextMenu.style.display = "none";
//};
// fermer si clic ailleurs
document.addEventListener("click", () => {
    contextMenu.style.display = "none";
});

//// position initiale

function createDeskBlock(x, y, count){
    let spacing = 90;

    for(let i = 0; i < count; i++){
        let desk = document.createElement("div");
        desk.className = "element studentDesk";
        desk.innerHTML = `
            <div class="desk-label">Bureau</div>
        `;

        desk.style.position = "absolute";

        // On calcule la position absolue directement par rapport à #classroom
        if(count === 2 || count === 4){
            desk.style.left = (x + (i * spacing)) + "px";
            desk.style.top = y + "px";
        }

        // On l'ajoute directement à la classe, sans intermédiaire !
        document.querySelector("#classroom").appendChild(desk);
        makeDraggable(desk);
    }
}

function createInitialLayout(){


    const classroom = document.querySelector("#classroom");
    classroom.innerHTML = "";

    // --- TABLEAU ---
    let board = document.createElement("div");
    board.className = "element teacherBoard";
    board.innerHTML = "Tableau";
    board.style.left = "325px";
    board.style.top = "30px";
    board.style.transformOrigin = "center center";
    classroom.appendChild(board);
    makeDraggable(board);

    // --- BUREAU PROF ---
    let prof = document.createElement("div");
    prof.className = "element teacherDesk";
    prof.innerHTML = "Prof";
    prof.style.left = "40px";
    prof.style.top = "40px";
    prof.rotation = 90;
    prof.style.transform = "rotate(90deg)";
    prof.style.transformOrigin = "center center";
    classroom.appendChild(prof);
    makeDraggable(prof);

    // --- POSITION DE DÉPART (LIBRE MAIS STRUCTURÉE) ---

    const startX = 40;
    const startY = 160;

    const spacingY = 80;

    // colonnes
    const colLeft = startX;
    const colCenter = startX + 220;
    const colRight = startX + 220 + 400;

    // nombre de lignes
    const rows = 5;

    for(let i = 0; i < rows; i++){

        // gauche (2)
        createDeskBlock(colLeft, startY + i * spacingY, 2);

        // centre (4) → une ligne de moins (optionnel mais réaliste)
        if(i < rows - 1){
            createDeskBlock(colCenter, startY + i * spacingY, 4);
        }

        // droite (2)
        if(i < rows - 1){
            createDeskBlock(colRight, startY + i * spacingY, 2);
        }

    }

        // 🔥 dernière ligne spéciale
    let lastY = startY + (rows - 1) * spacingY;

    // 2 bureaux à gauche (déjà couverts par boucle mais on peut forcer proprement)
    createDeskBlock(colLeft, lastY, 2);

    // 2 bureaux sous colonne centrale
    createDeskBlock(colCenter, lastY, 2);

    // (rien à droite)
}

function createNewStudentLabel(student) {
    let zone = document.getElementById("unassignedZone");
    let label = document.createElement("div");
    label.className = "student-label";
    label.textContent = student.label;
    
    // On attache les événements (Drag & Drop + Clic Droit)
    setupStudentLabelEvents(label);
    
    zone.appendChild(label);
}

window.addEventListener("DOMContentLoaded", () => {


    const studentsBtn = document.getElementById("studentsBtn");
    const studentsModal = document.getElementById("studentsModal");
    const closeBtn = document.getElementById("studentsCloseBtn");
    if(!studentsBtn || !studentsModal || !closeBtn) return;

    // ouvrir
    studentsBtn.addEventListener("click", () => {
        studentsModal.style.display = "flex";
    });

    // fermer
    closeBtn.addEventListener("click", () => {
        studentsModal.style.display = "none";
    });
    // Importer les élèves
    const importBtn = document.getElementById("importStudentsBtn");

    importBtn.addEventListener("click", () => {
        let text = document.getElementById("studentsInput").value;
        let lines = text.split("\n");

        lines.forEach(line => {
            let trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.toLowerCase() === "élèves") return;

            // On prend directement tout le texte de la ligne pour l'étiquette
            let newStudent = {
                fullName: trimmedLine,
                label: trimmedLine
            };

            students.push(newStudent);
            
            // On crée l'étiquette directement dans la zone
            createNewStudentLabel(newStudent);
        });

        document.getElementById("studentsInput").value = "";
        document.getElementById("studentsModal").style.display = "none";
    });
        
    if (DEV_MODE) {
        createTestStudents();
    }
});

//import des élèves en etiquettes
function renderUnassigned(){
    let zone = document.getElementById("unassignedZone");
    // On ne vide la zone visuelle que pour reconstruire proprement la liste
    zone.innerHTML = "";

    students.forEach(student => {
        let label = document.createElement("div");
        label.className = "student-label";
        label.textContent = student.label;
        
        // On attache les événements (Drag & Drop + Clic Droit)
        setupStudentLabelEvents(label);
        
        zone.appendChild(label);
    });
}

function startDragStudent(e) {
    draggedStudent = e.currentTarget || e.target;
    
    let rect = draggedStudent.getBoundingClientRect();

    studentOffsetX = e.clientX - rect.left;
    studentOffsetY = e.clientY - rect.top;

    // Si l'étiquette provient de la zone "Non affecté", on laisse un espaceur invisible
    if (draggedStudent.parentNode && draggedStudent.parentNode.id === "unassignedZone") {
        dragPlaceholder = document.createElement("div");
        dragPlaceholder.className = "student-label-placeholder";
        dragPlaceholder.style.width = rect.width + "px";
        dragPlaceholder.style.height = rect.height + "px";
        draggedStudent.parentNode.insertBefore(dragPlaceholder, draggedStudent);
    }

    draggedStudent.style.width = rect.width + "px";
    draggedStudent.style.position = "absolute";
    draggedStudent.style.zIndex = 1000;

    document.addEventListener("mousemove", moveStudent);
    document.addEventListener("mouseup", dropStudent);
}

function moveStudent(e) {
    if (!draggedStudent) return;

    // Déplacement visuel de l'étiquette
    draggedStudent.style.left = (e.clientX - studentOffsetX) + "px";
    draggedStudent.style.top = (e.clientY - studentOffsetY) + "px";

    // 1. Calculer les coordonnées du CENTRE de l'étiquette
    let studentRect = draggedStudent.getBoundingClientRect();
    let studentCenterX = studentRect.left + (studentRect.width / 2);
    let studentCenterY = studentRect.top + (studentRect.height / 2);

    let desks = document.querySelectorAll(".studentDesk");
    let closestDesk = null;
    let minDistance = Infinity;

    // 2. Chercher le bureau le plus proche parmi ceux qui sont touchés
    desks.forEach(desk => {
        desk.classList.remove("desk-highlight"); // Nettoyer les anciens survols

        let deskRect = desk.getBoundingClientRect();
        
        // Vérification basique : est-ce que l'étiquette touche ce bureau ?
        let isIntersecting = !(
            studentRect.right < deskRect.left || 
            studentRect.left > deskRect.right || 
            studentRect.bottom < deskRect.top || 
            studentRect.top > deskRect.bottom
        );

        if (isIntersecting) {
            // Si ça touche, on calcule la distance exacte entre les deux centres (Théorème de Pythagore)
            let deskCenterX = deskRect.left + (deskRect.width / 2);
            let deskCenterY = deskRect.top + (deskRect.height / 2);
            
            let distance = Math.hypot(studentCenterX - deskCenterX, studentCenterY - deskCenterY);
            
            // On mémorise uniquement le bureau le plus proche
            if (distance < minDistance) {
                minDistance = distance;
                closestDesk = desk;
            }
        }
    });

    // 3. Appliquer l'effet visuel UNIQUEMENT au bureau vainqueur
    if (closestDesk) {
        closestDesk.classList.add("desk-highlight");
    }
}

function dropStudent(e) {
    if (!draggedStudent) return;

    document.removeEventListener("mousemove", moveStudent);
    document.removeEventListener("mouseup", dropStudent);

    let targetDesk = document.querySelector(".desk-highlight");

    document.querySelectorAll(".studentDesk").forEach(d => d.classList.remove("desk-highlight"));

    if (targetDesk) {
        if (targetDesk.assignedStudent && targetDesk.assignedStudent !== draggedStudent) {
            resetStudentToList(targetDesk.assignedStudent);
        }

        document.querySelectorAll(".studentDesk").forEach(d => {
            if (d.assignedStudent === draggedStudent) {
                d.assignedStudent = null;
                let oldLabel = d.querySelector(".desk-label");
                if (oldLabel) oldLabel.textContent = "Bureau";
            }
        });

        targetDesk.assignedStudent = draggedStudent;
        
        let labelEl = targetDesk.querySelector(".desk-label");
        if (!labelEl) {
            labelEl = document.createElement("div");
            labelEl.className = "desk-label";
            targetDesk.appendChild(labelEl);
        }
        
        labelEl.textContent = draggedStudent.textContent;
        
        // Supprimer l'espaceur temporaire et l'étiquette volante
        if (dragPlaceholder) {
            dragPlaceholder.remove();
            dragPlaceholder = null;
        }
        draggedStudent.remove();

    } else {
        // En cas de lâcher dans le vide : l'étiquette se remet exactement à son emplacement d'origine
        if (dragPlaceholder && dragPlaceholder.parentNode) {
            dragPlaceholder.parentNode.replaceChild(draggedStudent, dragPlaceholder);
            dragPlaceholder = null;
        }
        resetStudentToList(draggedStudent);
    }

    draggedStudent = null;
}

function checkDropOnDesk(studentEl) {

    let studentRect = studentEl.getBoundingClientRect();
    let desks = document.querySelectorAll(".studentDesk");

    let placed = false;

    for (let desk of desks) {

        let deskRect = desk.getBoundingClientRect();

        let overlap =
            studentRect.left < deskRect.right &&
            studentRect.right > deskRect.left &&
            studentRect.top < deskRect.bottom &&
            studentRect.bottom > deskRect.top;

        if (overlap) {

            let oldStudent = desk.assignedStudent;

            if (oldStudent) {
                resetStudentToList(oldStudent);
            }

            desk.assignedStudent = studentEl;

            let label = desk.querySelector(".desk-label");
            if (label) {
                label.textContent = studentEl.textContent;
            }

            studentEl.dataset.assignedDesk = desk.dataset?.id || "";

            studentEl.remove();
            
            placed = true;
            break;
            
        }
    }

    return placed;
}

function resetStudentToList(student) {
    let zone = document.getElementById("unassignedZone");
    
    if (student.parentNode !== zone) {
        zone.appendChild(student);
    }

    student.style.position = "static";
    student.style.left = "";
    student.style.top = "";
    student.style.zIndex = "";
    student.style.transform = "";
    student.style.width = ""; 
}

//document.getElementById("undo").onclick = () => {
//    if (!lastAction) return;
//
//    let { student, desk, previousStudent } = lastAction;
//
//    desk.assignedStudent = previousStudent || null;
//    desk.textContent = previousStudent ? previousStudent.textContent : "Bureau";
//
//    if (previousStudent) {
//        document.getElementById("classroom").appendChild(previousStudent);
//    }
//
//    document.getElementById("unassignedZone").appendChild(student);
//    student.style.position = "static";
//
//    lastAction = null;
//};

function createTestStudents() {

    students = [
        { fullName: "Alice Martin", label: "Alice M." },
        { fullName: "Benoît Durand", label: "Benoît D." },
        { fullName: "Chloé Petit", label: "Chloé P." },
        { fullName: "David Bernard", label: "David B." },
        { fullName: "Emma Leroy", label: "Emma L." }
    ];

    renderUnassigned();
}

document.getElementById("clearStudents").onclick = function () {

    let desks = document.querySelectorAll(".studentDesk");

    desks.forEach(desk => {

        if (desk.assignedStudent) {

            resetStudentToList(desk.assignedStudent);

            desk.assignedStudent = null;

            let label = desk.querySelector(".desk-label");

            if (label) {
                label.textContent = "Bureau";
            }

        }

    });

};

// ==========================================
// AFFICHAGE DYNAMIQUE DU NOM DE LA CLASSE
// ==========================================
const classNameInput = document.getElementById("classNameInput");
const titleClassName = document.getElementById("titleClassName");

classNameInput.addEventListener("input", function() {
    if (this.value.trim() !== "") {
        titleClassName.textContent = "- " + this.value.trim();
    } else {
        titleClassName.textContent = "";
    }
});

// ==========================================
// LOGIQUE D'EXPORTATION (JSON ET PDF INTELLIGENTS)
// ==========================================

// EXPORT JSON
// EXPORT JSON
document.getElementById("exportJson").onclick = function() {
    let hasStudents = false;
    let className = classNameInput.value.trim();
    
    // 👥 Récupération des étiquettes actuellement dans la zone "Non affecté"
    let unassignedStudents = [];
    document.querySelectorAll("#unassignedZone .student-label").forEach(label => {
        unassignedStudents.push(label.textContent.trim());
    });
    
    if (unassignedStudents.length > 0) {
        hasStudents = true;
    }

    let data = {
        className: className,
        classroomSize: {
            width: document.querySelector("#classroom").clientWidth,
            height: document.querySelector("#classroom").clientHeight
        },
        elements: [],
        unassignedStudents: unassignedStudents // 👈 Sauvegarde des non affectés
    };

    document.querySelectorAll("#classroom .element").forEach(el => {
        let type = "unknown";
        if (el.classList.contains("studentDesk")) type = "studentDesk";
        else if (el.classList.contains("teacherDesk")) type = "teacherDesk";
        else if (el.classList.contains("teacherBoard")) type = "teacherBoard";

        let studentLabel = null;
        if (type === "studentDesk") {
            let labelEl = el.querySelector(".desk-label");
            if (labelEl && labelEl.textContent !== "Bureau") {
                studentLabel = labelEl.textContent;
                hasStudents = true;
            }
        }

        data.elements.push({
            type: type,
            left: parseInt(el.style.left) || 0,
            top: parseInt(el.style.top) || 0,
            rotation: el.rotation || 0,
            textFlipped: el.classList.contains("text-flipped"),
            student: studentLabel,
            backgroundColor: el.style.backgroundColor || ""
        });
    });

    // 🗓️ RÉCUPÉRATION DE LA DATE (Mois-Année)
    let d = new Date();
    let month = String(d.getMonth() + 1).padStart(2, '0');
    let year = d.getFullYear();
    let dateSuffix = `${month}-${year}`;

    // 🧠 LOGIQUE DU NOM DE FICHIER JSON
    let safeClassName = className.replace(/[^a-zA-Z0-9_\- ]/g, "").trim(); 
    let baseName = hasStudents ? "plan_de_classe" : "disposition_salle";
    let filename = safeClassName 
        ? `${baseName}_${safeClassName}_${dateSuffix}.json` 
        : `${baseName}_${dateSuffix}.json`;

    let jsonString = JSON.stringify(data, null, 4);
    let blob = new Blob([jsonString], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    
    let a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

// EXPORT PDF
document.getElementById("exportPdf").onclick = function() {
    let hasStudents = Array.from(document.querySelectorAll(".studentDesk")).some(desk => desk.assignedStudent);
    let className = classNameInput.value.trim();
    
    // 🗓️ RÉCUPÉRATION DE LA DATE (Mois-Année)
    let d = new Date();
    let month = String(d.getMonth() + 1).padStart(2, '0');
    let year = d.getFullYear();
    let dateSuffix = `${month}-${year}`;
    
    // 🧠 LOGIQUE DU NOM DE FICHIER PDF
    let baseName = hasStudents ? "Plan de classe" : "Disposition salle";
    let printTitle = className 
        ? `${baseName} - ${className} (${dateSuffix})` 
        : `${baseName} (${dateSuffix})`;
    
    let originalTitle = document.title;
    document.title = printTitle; // Applique le titre avec la date pour le PDF
    
    window.print();
    
    document.title = originalTitle;
};

// ==========================================
// LOGIQUE D'IMPORTATION D'UN FICHIER JSON
// ==========================================

// Déclenche le sélecteur de fichier caché quand on clique sur le bouton visible
document.getElementById("triggerImportJson").onclick = function() {
    document.getElementById("importJsonInput").click();
};

// Gestionnaire d'événement lorsque l'utilisateur sélectionne un fichier
// Gestionnaire d'événement lorsque l'utilisateur sélectionne un fichier
document.getElementById("importJsonInput").onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);

            // 0. Restaurer le nom de la classe
            if (data.className) {
                document.getElementById("classNameInput").value = data.className;
                document.getElementById("titleClassName").textContent = "- " + data.className;
            } else {
                document.getElementById("classNameInput").value = "";
                document.getElementById("titleClassName").textContent = "";
            }

            // 1. Nettoyer la classe et la zone "Non affecté"
            const classroom = document.querySelector("#classroom");
            classroom.innerHTML = "";

            const unassignedZone = document.getElementById("unassignedZone");
            unassignedZone.innerHTML = "";
            students = [];

            // 2. Restauration des étiquettes non affectées
            if (data.unassignedStudents && Array.isArray(data.unassignedStudents)) {
                data.unassignedStudents.forEach(studentText => {
                    let newStudent = {
                        fullName: studentText,
                        label: studentText
                    };
                    students.push(newStudent);
                    createNewStudentLabel(newStudent);
                });
            }

            // 3. Parcourir et recréer chaque élément sauvegardé
            data.elements.forEach(item => {
                let el = document.createElement("div");
                el.style.position = "absolute";
                el.style.left = item.left + "px";
                el.style.top = item.top + "px";
                el.rotation = item.rotation || 0;
                el.style.transform = `rotate(${el.rotation}deg)`;
                el.style.transformOrigin = "center center";

                if (item.type === "studentDesk") {
                    el.className = "element studentDesk";
                    
                    if (item.textFlipped) {
                        el.classList.add("text-flipped");
                    }

                    if (item.student) {
                        el.innerHTML = `<div class="desk-label">${item.student}</div>`;
                        
                        let labels = document.querySelectorAll("#unassignedZone .student-label");
                        for (let label of labels) {
                            if (label.textContent === item.student) {
                                el.assignedStudent = label; 
                                label.remove();
                                break;
                            }
                        }
                        
                        if (!el.assignedStudent) {
                            let fakeStudent = document.createElement("div");
                            fakeStudent.className = "student-label";
                            fakeStudent.textContent = item.student;
                            setupStudentLabelEvents(fakeStudent); 
                            el.assignedStudent = fakeStudent;
                        }

                    } else {
                        el.innerHTML = `<div class="desk-label">Bureau</div>`;
                    }

                } else if (item.type === "teacherDesk") {
                    el.className = "element teacherDesk";
                    el.innerHTML = "Prof";
                } else if (item.type === "teacherBoard") {
                    el.className = "element teacherBoard";
                    el.innerHTML = "Tableau";
                }

                if (item.backgroundColor) {
                    el.style.backgroundColor = item.backgroundColor;
                }

                classroom.appendChild(el);
                makeDraggable(el);
            });

            alert("Plan de classe chargé avec succès !");

        } catch (error) {
            alert("Erreur lors de la lecture du fichier JSON. Assurez-vous que le fichier est valide.");
            console.error(error);
        }
        
        e.target.value = "";
    };

    reader.readAsText(file);
};
// ==========================================
// GESTION import csv
// ==========================================
// ==========================================
// GESTION import csv (NOM Prénom)
// ==========================================
document.getElementById("importSimpleListBtn").addEventListener("click", () => {
    document.getElementById("simpleListInput").click();
});

document.getElementById("simpleListInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/);

    lines.forEach((line) => {
        const trimmedLine = line.trim();
        
        // On ignore les lignes vides ou le titre "Élèves"
        if (!trimmedLine || trimmedLine === "Élèves") return;

        // On envoie toute la ligne à la fonction corrigée
        addStudentToPool(trimmedLine);
           
        });

    alert("Importation terminée !");
});

// Logique pour créer l'élément dans la zone "Non affecté"
function addStudentToPool(nomComplet) {
    // 1. On cherche la position du TOUT DERNIER espace
    const lastSpaceIndex = nomComplet.lastIndexOf(' ');
    
    let nom, prenom;

    if (lastSpaceIndex !== -1) {
        // Tout ce qui est avant le dernier espace = Nom
        nom = nomComplet.substring(0, lastSpaceIndex).trim();
        // Tout ce qui est après le dernier espace = Prénom
        prenom = nomComplet.substring(lastSpaceIndex + 1).trim();
    } else {
        // Cas rare où il n'y a pas d'espace
        nom = nomComplet;
        prenom = "";
    }

    // 2. On crée l'objet élève
    let newStudent = {
        fullName: `${nom} ${prenom}`,
        label: `${prenom} ${nom.charAt(0)}.` 
    };
    students.push(newStudent);

    // 3. On crée l'élément HTML (étiquette)
    let zone = document.getElementById("unassignedZone");
    let label = document.createElement("div");
    label.className = "student-label";
    label.textContent = newStudent.label;
    lsetupStudentLabelEvents(label);
    zone.appendChild(label);
}
// ==========================================
// GESTION DU MODE VUE PROF (TEXTE RETOURNÉ)
// ==========================================

let isTeacherViewActive = false;

document.getElementById("toggleTeacherView").onclick = function() {
    isTeacherViewActive = !isTeacherViewActive;
    
    // Changer l'apparence du bouton pour montrer l'état actif/inactif
    if (isTeacherViewActive) {
        this.textContent = "💻 Mode Normal (Vue Élève)";
        this.style.backgroundColor = "#2196F3"; // Bleu en mode normal
    } else {
        this.textContent = "👨‍🏫 Mode Miroir (Vue Prof)";
        this.style.backgroundColor = "#4CAF50"; // Vert en mode prof
    }
    
    // Appliquer la rotation à tous les bureaux d'élèves actuels
    applyTeacherViewToAllDesks();
};

function applyTeacherViewToAllDesks() {
    const desks = document.querySelectorAll(".studentDesk");
    desks.forEach(desk => {
        if (isTeacherViewActive) {
            desk.classList.add("teacher-view");
        } else {
            desk.classList.remove("teacher-view");
        }
    });
}


// Modifier une étiquette de la zone "Non affecté"
document.getElementById("editStudentLabel").onclick = function() {
    if (!currentStudentLabel) return;
    
    const newName = prompt("Modifier le texte de l'étiquette :", currentStudentLabel.textContent);
    if (newName !== null && newName.trim() !== "") {
        currentStudentLabel.textContent = newName.trim();
    }
    contextMenu.style.display = "none";
    currentStudentLabel = null;
};

// Supprimer une étiquette de la zone "Non affecté"
document.getElementById("deleteStudentLabel").onclick = function() {
    if (!currentStudentLabel) return;

    let labelText = currentStudentLabel.textContent;
    students = students.filter(s => s.label !== labelText && s.fullName !== labelText);

    currentStudentLabel.remove();
    contextMenu.style.display = "none";
    currentStudentLabel = null;
};


// Fonction pour éditer une étiquette
function setupStudentLabelEvents(label) {
    // Clic gauche : déplacement
    label.addEventListener("mousedown", (e) => {
        if (e.button === 2) return; // Bloque le glisser-déposer si c'est un clic droit
        startDragStudent(e);
    });

    // Clic droit : ouvre le menu pour l'étiquette
    label.addEventListener("contextmenu", (e) => {
        e.preventDefault(); 
        e.stopPropagation();

        currentStudentLabel = label;
        currentElement = null;

        // Masquer les boutons réservés aux bureaux / éléments
        document.getElementById("removeStudent").style.display = "none";
        document.getElementById("deleteElement").style.display = "none";
        document.getElementById("toggleDeskText").style.display = "none";
        document.getElementById("changeDeskColor").style.display = "none"; // 👈 À rajouter dans le bloc contextmenu
        document.getElementById("colorRed").style.display = "none";
        document.getElementById("colorGreen").style.display = "none";
        document.getElementById("colorYellow").style.display = "none";
        document.getElementById("colorReset").style.display = "none";
        // Afficher uniquement les boutons de l'étiquette
        document.getElementById("editStudentLabel").style.display = "block";
        document.getElementById("deleteStudentLabel").style.display = "block";

        // Afficher le menu à l'emplacement de la souris
        contextMenu.style.display = "block";
        contextMenu.style.left = e.pageX + "px";
        contextMenu.style.top = e.pageY + "px";
    });
}


// Appliquer les couleurs prédéfinies
document.getElementById("colorRed").onclick = function() {
    if (currentElement) currentElement.style.backgroundColor = "#ffab91"; // Rouge doux
    contextMenu.style.display = "none";
};

document.getElementById("colorGreen").onclick = function() {
    if (currentElement) currentElement.style.backgroundColor = "#a5d6a7"; // Vert doux
    contextMenu.style.display = "none";
};

document.getElementById("colorYellow").onclick = function() {
    if (currentElement) currentElement.style.backgroundColor = "#fff59d"; // Jaune doux
    contextMenu.style.display = "none";
};

document.getElementById("colorReset").onclick = function() {
    if (currentElement) currentElement.style.backgroundColor = ""; // Réinitialise la couleur CSS de base
    contextMenu.style.display = "none";
};

// 🎨 Événements des boutons de couleurs (SÉCURISÉ)
const colorMap = {
    colorRed: "#ffab91",
    colorGreen: "#a5d6a7",
    colorYellow: "#fff59d",
    colorReset: ""
};

Object.keys(colorMap).forEach(id => {
    let btn = document.getElementById(id);
    if (btn) {
        btn.onclick = function() {
            if (currentElement) {
                currentElement.style.backgroundColor = colorMap[id];
            }
            contextMenu.style.display = "none";
        };
    }
});

// ⚠️ RECOMMANDATION DE SÉCURITÉ POUR VOS FONCTIONS EXISTANTES :
// Pour que la rotation reste active quand vous ajoutez des bureaux ou importez un JSON,
// vous pouvez appeler la fonction `applyTeacherViewToAllDesks()` :
// 1. À la toute fin de votre fonction `makeDraggable` (ou là où vous créez un bureau)
// 2. À la toute fin du chargement de votre fichier JSON.
createInitialLayout();
