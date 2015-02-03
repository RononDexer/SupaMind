SupaMind
========

Explication de la restructuration du code :
-------------------------------------------
 - Utilisation du paradigme objet et création de la classe Node comme convenu lors des réunions. 
 - Distinction des modes visualisation et édition comme déjà convenu
 - Prise en charge réelle d'un json réel et des erreurs de base 
 
 TODO du plus prioritaire au moins:
 ----------------------------------
 - pour *addChildrenAndLayout()*: automatiser les calculs au lieu d'utiliser des valeurs prédef puis appeler en récursif pour faire tout l'arbre
 - debug si besoin de *visualization*=**true** *edition*=**true**
 - mise en place des boutons (interface graphique) / pouvoir créér sans JSON
 - pour JSON : changer le format(attributs) des objets dans JSON pour qu'il corresponde à l'architecture un modèle objet choisi ensemble précédemment
 - pour JSON : rajouter une sécurité en évitant les injections de code par JSON
