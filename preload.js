const fs = require("fs");

var p1 = [508, 160];
var p2 = [2044, 1312];
var multiplier;
const hitObjectRegex = /(\d+),(\d+),(\d+),(.*)/g;

var osusongsfolder = null;
var isSongPlaying = false;
var _beatmap;


var EnableDebugOutput = true;
window.onload = async () => {
    multiplier = (p2[0] - p1[0]) / 512;

    // connect to gosumemory websocket
    const ws = new WebSocket("ws://localhost:24050/ws");
    ws.onopen = () => {
        console.log("Connected to gosumemory websocket");
    }
    ws.onmessage = (msg) => {
        msg = JSON.parse(msg.data);
        if (osusongsfolder == null)
            osusongsfolder = msg.settings.folders.songs;
        
        isSongPlaying = msg.menu.state === 2;

        if (isSongPlaying && _beatmap == null)
        {
            // get current beatmap
            var beatmap = msg.menu.bm.path.folder + "\\" + msg.menu.bm.path.file;
            
            var beatmapPath = `${osusongsfolder}/${beatmap}`;
            var beatmapData = fs.readFileSync(beatmapPath, "utf8");
            var hitObjects = beatmapData.split("[HitObjects]\r\n")[1].split("\r\n");
            hitObjects = hitObjects.filter(x => x != "");
            if (hitObjects.Length < 0 || hitObjects[0] == null)
                return;
            for (var i = 0; i < hitObjects.length; i++)
            {
                
                var hitObject = hitObjects[i].split(",");
                hitObjects[i] = [ hitObject[2], hitObject[0], hitObject[1] ]
            }
            _beatmap = hitObjects;
        }
        
        if (!isSongPlaying && _beatmap != null)
        {
            _beatmap = null;
            // delete all circles
            var circles = document.getElementsByClassName("circle");
            for (var i = 0; i < circles.length; i++)
            {
                circles[i].remove();
            }
        }

        if (isSongPlaying)
        {
            var currentTime = msg.menu.bm.time.current;
            
            // create circle 3 seconds before game object and delete after 3 seconds
            var currentHitObject = _beatmap.filter(x => (x[0] > currentTime) && (x[0] < currentTime + 1000));

            if (currentHitObject.length > 0)
            {
                for (var i = 0; i < currentHitObject.length; i++)
                {
                    time_before = currentHitObject[i][0] - currentTime;
                    CreateCircle(currentHitObject[i][1], currentHitObject[i][2], time_before, currentHitObject[i][0]);
                }
            }


            document.getElementById("DebugData").innerHTML = `crt:${currentTime}<br>objt: ${currentHitObject[0]}`;
            
        }
        
        if(EnableDebugOutput)
            console.log(msg);

    }
    
};

function CreateCircle(x, y, time_before, actual_time)
{
    size = time_before / 1000 * 25;
    position = [p1[0] + (x * multiplier), p1[1] + (y * multiplier)];

    // color from green to red based on how close time_before is to 0
    var color = `rgb(${255 - (time_before / 1000 * 255)}, ${time_before / 1000 * 255}, 0)`;

    console.log(`[pos] ${size}`);

    var circle = document.createElement("div");
    circle.style.position = "absolute";
    circle.style.backgroundColor = "transparent";
    circle.style.border = "6px solid "+color;
    circle.style.borderRadius = "50%";
    circle.style.width = size+"px";
    circle.style.height = size+"px";
    circle.style.opacity = 1;

    circle.style.left = position[0] + "px";
    circle.style.top = position[1] + "px";

    circle.setAttribute("time", actual_time);

    document.body.appendChild(circle);

    // remove after 1 second
    setTimeout(() => {
        circle.remove();
    }, 100);

}