class File {
    constructor(name, content) {
        this.name = name;
        this.content = content;
    }

    getContent() {
        // make sure this handles opening a new window for resume
        return this.content;
    }
}

class Folder {
    constructor(name) {
        this.name = name;
        this.path = "/" + name;
        this.subfolders = [] // recursive structure of more Folder objects  
        this.files = [] // array of Files
        this.parent = undefined                           
    }

    addFolder(folder) {
        this.subfolders.push(folder);
        folder.path = this.path + "/" + folder.name;
        folder.parent = this;
    }

    addFile(file) {
        this.files.push(file);
    }
}

const cons = document.getElementById("console");
const fixed = document.getElementById("fixedtext");
const consbox = document.getElementById("consolebox");
const prefix = document.getElementById("prefix");
const header = document.getElementById("header");
const ENTER = 13;
const UP = 38;
const DOWN = 40;

var loaded = false;
var root = new Folder("home");
var curFolder = root;
var index = 0;
const previousCommands = [""];
var openEncryptFile = false;


// root files ---------------------
root.addFile(new File("RESUME"));

// root folders
var about = new Folder("about");
var projects = new Folder("projects");
var misc = new Folder("misc");
root.addFolder(about);
root.addFolder(projects);
root.addFolder(misc);
// -------------------------------

// about folder ------------------
about.addFile(new File("bio.txt", "Hi! My name is Jenny Zhang and I am a third year Computer Science student at the University of Waterloo.<br> I love game development, digital character design, and volleyball!"))
about.addFile(new File("contact_me.txt", 
    "Phone: 343-998-9722<br>"+
    "Email: <a href=mailto:jennyzhanng@gmail.com target=_blank>jennyzhanng@gmail.com</a><br>" +
    "Github: <a href=https://github.com/j3nny-zhang target=_blank>https://github.com/j3nny-zhang</a><br>" +
    "LinkedIn: <a href=https://www.linkedin.com/in/jennyzhanng/ target=_blank>https://www.linkedin.com/in/jennyzhanng/</a><br>"
));
about.addFile(new File("education.txt", "University of Waterloo.<br>Candidate for Bachelor of Computer Science: AI Specialization, Combinatorics and Optimization minor."));
about.addFile(new File("skills.txt", 
    "Languages: Python, Java, JavaScript, C++, C, C#, Bash, SQL, PHP, HTML<br>" +
    "Tools/Frameworks: Git, Docker, AWS, React.js, Vue.js, Node.js, Flask, Laravel, MongoDB, MySQL, Unity"
));
// -------------------------------

// projects folder ---------------

// -------------------------------
projects.addFile(new File("ai_website_generator.txt",
    "A personalized landing page generator using OpenAI's LLM and CohereAPI.<br>" +
    "Built with JavaScript, React.js, Node.js, MongoDB, Cohere LLM API, OpenAI API.<br>" +
    "Source: <a href=https://tinyurl.com/landing-page-generator target=_blank>https://tinyurl.com/landing-page-generator<\a>"
));
projects.addFile(new File("gameboy_emulator.txt",
    "A Game Boy CPU core emulator, allowing users to play nostalgic games such as Pokemon and Tetris.<br>" +
    "Built with C and the SDL library.<br>" +
    "Source: <a href=https://tinyurl.com/gameboy-emulator target=_blank>https://tinyurl.com/gameboy-emulator<\a>"
));
projects.addFile(new File("tetris.txt",
    "A multiplayer tetris game played through the command line interface and/or graphic interface.<br>" +
    "Built with C++ and the Xming display server.<br>" +
    "Source: <a href=https://tinyurl.com/multiplayer-tetris target=_blank>https://tinyurl.com/multiplayer-tetris<\a>"
));
projects.addFile(new File("christmas_game.txt", 
    "A simple Christmas-themed game with custom pixel art created in Aseprite.<br>" +
    "Built with Unity and Aseprite.<br>" +
    "Source: <a href=https://tinyurl.com/christmas-unity-game target=_blank>https://tinyurl.com/christmas-unity-game<\a>"
));
projects.addFile(new File("java_plugins.txt",
    "Custom Java plugins to modify Minecraft's core game mechanics.<br>" +
    "Built with Java and SpigotAPI.<br>" +
    "Source: <a href=https://github.com/j3nny-zhang/Minecraft-Plugins target=_blank>https://github.com/j3nny-zhang/Minecraft-Plugins<\a>"
));

// misc folder -------------------
misc.addFile(new File("pufferfish"));
misc.addFile(new File("secret.txt", "The encryption key for the keyword cipher is: 'caesar'."));
misc.addFile(new File("cipher.txt", "The cipher text is: 'nubbrpbgqf'."));
misc.addFile(new File("encrypt.txt", "Ha! You got the correct password. Now you'll have to ask Jenny what the next steps to this puzzle are..."));


// string functions
function pad(str, len){
    for(let i = 0; i < len; i ++){
        str = str + "&nbsp;";
    }
    return str;
}

async function slowText(str){
    const mod = 4;
    let cnt = 0;
    for(c of str){
        if(cnt == mod - 1){
            await new Promise(r => setTimeout(r, 1));
        }
        if(c == "=") append("<br>");
        else append(c);
        cnt = (cnt + 1) % mod;
    }
}

function append(str){ // append string to console
    fixed.innerHTML = fixed.innerHTML + str;
    consbox.scrollTop = consbox.scrollHeight;
}

// header functions
function getUserPrefix() {
    return '<span class=green>jennyzhang@my-personal-website</span>:<span class="lime">' + curFolder.path + '</span>$&nbsp;'
}

function setHeader() {
    return header.innerHTML = 'jennyzhang@my-personal-website:&nbsp;' + curFolder.path + '';
}

// folder and file functions
function getFolder(ostr, getf=false){
    str = ostr;
    if(str.startsWith("/") || str.startsWith("\\")){
        str = "home" + str;
    }
    else{
        str = curFolder.path + "/" + str;
    }
    let arr = str.split(/\/|\\/).filter((x) => {return x != ""});
    
    cur = root;
    for(let i = 1; i < arr.length; i ++){
        if(i == arr.length - 1 && getf){
            for(let file of cur.files){
                if(file.name == arr[i]){
                    return file;
                }
            }
            return undefined;
        }


        if(arr[i] == ".") continue;
        if(arr[i] == ".."){
            if(cur.parent){
                cur = cur.parent;
                continue;
            }
            else{
                return undefined;
            }
        }

        found = false;
        for(let sub of cur.subfolders){
            if(sub.name == arr[i]){
                found = true;
                cur = sub;
                break;
            }
        }
        if(found) continue;
        return undefined;
    }
    return cur;
}

function lsHelper(cur) {
    var folders = "";
    var files = "";

    for (subfolder of cur.subfolders) {
        folders += subfolder.name;
        folders = pad(folders, 5);
    }
    append("<span class='aqua'>" + folders + "<\span>");

    for (file of cur.files) {
        files += file.name;
        files = pad(files, 5);
    }
    files += "<br>";
    append("<span class='blue'>" + files + "<br> <\span>");
}

function getFile(ostr){
    return getFolder(ostr, true);
}


// handle
function handleEncryption() {
    let password = prompt("Please enter the password", "Password");
    if (password == "pufferfish") {
        return true;
    } 
    return false;
}

function command(str) {
    previousCommands.splice(previousCommands.length - 1, 0, str); // treat like stack
    index = 0;

    append(getUserPrefix() + str + "<br>");
    let args = str.split(" ").filter((x) => {return x != ""}); // split off string by spaces, arg[0] should contain the command

    if (args.length == 0) return;
    if (args[0] == "help" && args.length == 1) {
        var s = 
        "Welcome to Jenny's personal terminal shell. There are four simple commands to navigate around:<br>" +
        "&nbsp;&nbsp;help: Display information about commands.<br>" + 
        "&nbsp;&nbsp;cat &lt;file-path&gt;: View file contents.<br>" + 
        "&nbsp;&nbsp;cd &lt;directory&gt;: Change the current directory.<br>" + 
        "&nbsp;&nbsp;ls [directory]: List the contents of a directory, or the current directory if no argument is provided.<br>" + 
        "&nbsp;&nbsp;clear: Clear previous commands.<br><br>" + 
        "Feel free to use the up/down arrow keys to autofill previous commands :) <br>";
        append("<span class='yellow'>" + s + "<br> <\span>");
    } else if (args[0] == "ls") {
        if (args.length == 1) { // current directory
            if (curFolder.subfolders.length == 0 && curFolder.files.length == 0) {
                // do nothings
            } else {
                lsHelper(curFolder);
            }
        }  else if (args.length == 2) { // specified directory
            folder = getFolder(args[1]);
            if (!folder) {
                var s = "Directory not found D: <br>"
                append("<span class='red'>" + s + "<br> <\span>")
            } else {
                lsHelper(folder);
            }
        } else { // directory doesn't exist :()
            var s = "Directory not found D: <br>"
            append("<span class='red'>" + s + "<br> <\span>")
        }

    } else if (args[0] == "cat") {
        if (args.length == 1) {
            var s = "This command expects a file as an argument. <br>";
            append("<span class='red'>" + s + "<br> <\span>");
        } else if (args.length == 2) {
            file = getFile(args[1]);
            if (file){
                let s = file.content + "<br>";
                if (s) {
                    if (args[1] == "RESUME") {
                        window.open("Jenny_Zhang_Resume.pdf", '_blank');
                    } else if (args[1] == "pufferfish") {
                        append("<img src='images/pufferfish.png' alt='pufferfish :)'> <br>");
                        append("<span class='yellow'> I just really like pufferfish! <br><br> <\span>");
                    } else if (args[1] == "encrypt.txt") {
                        if (handleEncryption()) {
                            append("<span class='yellow'>" + s + "<br> <\span>")
                        } else {
                            append("<span class='red'> Incorrect password. <br> <\span>")
                        }
                    } else {
                        append("<span class='yellow'>" + s + "<br> <\span>");
                    }
                }
            }
            else {
                var s = "File not found D: <br>"
                append("<span class='red'>" + s + "<br> <\span>")
            }
        } else {
            var s = "File not found D: <br>";
            append("<span class='red'>" + s + "<br> <\span>");
        }
    } else if (args[0] == "cd") {
        if(args.length == 2){
            folder = getFolder(args[1]);
            if (folder) {
                curFolder = folder;
                prefix.innerHTML = getUserPrefix();
                setHeader();
            } else {
                var s = "Directory not found D: <br>";
                append("<span class='red'>" + s + "<br> <\span>");
            }

        }
        else {
            var s = "Directory not found D: <br>";
            append("<span class='red'>" + s + "<br> <\span>");
        }
    } else if (args[0] == "clear") {
        fixed.innerHTML = "";
    } else {
        var s = "Unknown command. Type 'help' to see a list of commands. <br>";
        append("<span class='red'>" + s + "<br> <\span>");
    }
}


// main function

async function startup() {
    setHeader();
    append("<span class='yellow'> Starting up... <\span><br><br>");
    await new Promise(r => setTimeout(r, 800));
    
    fancy_name_string = 
        "░░░░▒█░█▀▀░█▀▀▄░█▀▀▄░█░░█░░░▒█▀▀▀█░█░░░░█▀▀▄░█▀▀▄░█▀▀▀=" +
        "░░░░▒█░█▀▀░█░▒█░█░▒█░█▄▄█░░░░▄▄▄▀▀░█▀▀█░█▄▄█░█░▒█░█░▀▄=" +
        "░▒█▄▄█░▀▀▀░▀░░▀░▀░░▀░▄▄▄▀░░░▒█▄▄▄█░▀░░▀░▀░░▀░▀░░▀░▀▀▀▀=";
    slowText(fancy_name_string);
    await new Promise(r => setTimeout(r, 600));
    append("<span class='yellow'><br>Type 'help' to see a list of commands<br><br>");
    await new Promise(r => setTimeout(r, 500));
    prefix.innerHTML = getUserPrefix();
    loaded = true;
}

startup()

cons.onkeydown = e => {
    if (!loaded) {
        e.preventDefault();
        return;
    }

    if ((e.keyCode && e.keyCode == ENTER) || (e.charCode && e.charCode == ENTER)) {
        command(cons.value);
        cons.value = "";
        e.preventDefault();
    } else if ((e.keyCode && e.keyCode == UP) || (e.charCode && e.charCode == UP)) {
        index += 1;

        // make sure the index is within range
        if (index < 0) {
            index = 0;
            e.preventDefault();
            return;
        } else if (index >= previousCommands.length) {
            index = previousCommands.length - 1;
            e.preventDefault();
            return;
        } else { // within range
            cons.value = previousCommands[previousCommands.length - 1 - index];
        }
        e.preventDefault();
    } else if ((e.keyCode && e.keyCode == DOWN) || (e.charCode && e.charCode == DOWN)) {
        index -= 1;
        if (index < 0) {
            index = 0;
            cons.value = "";
            e.preventDefault();
            return;
        } else if (index >= previousCommands.length) {
            index = previousCommands.length - 1;
            e.preventDefault();
            return;
        } else {
            cons.value = previousCommands[previousCommands.length - 1 - index];
        }
        e.preventDefault();
    }

}