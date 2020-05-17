//var connection = new WebSocket('ws://' + window.location.hostname + ':1780/jsonrpc');
var connection = new WebSocket('ws://127.0.0.1:1780/jsonrpc');

var server;

connection.onmessage = function (e) {
    var recv = e.data
    // console.log(recv); 
    var answer = JSON.parse(recv);
    console.log(answer)
    if (answer.id == 1) {
        server = answer.result;
    } else if (Array.isArray(answer)) {
        for (let i = 0; i < answer.length; i++) {
            action(answer[i]);
        }
    } else {
        action(answer);

    }
    show()
}

connection.onopen = function () {
    send('{"id":1,"jsonrpc":"2.0","method":"Server.GetStatus"}')
}

connection.onerror = function () {
    alert("error");
}

function action(answer) {
    switch (answer.method) {
        case 'Client.OnVolumeChanged':
        case 'Client.OnLatencyChanged':
        case 'Client.OnNameChanged':
            clientChange(answer.params);
            break;
        case 'Client.OnConnect':
        case 'Client.OnDisconnect':
            clientConnect(answer.params);
            break;
        case 'Group.OnMute':
            groupMute(answer.params);
            break;
        case 'Group.OnStremChanged':
            groupStream(answer.params);
            break;
        case 'Stream.OnUpdate':
            streamUpdate(answer.params);
            break;
        case 'Server.OnUpdate':
            server = answer.params;
            break;
        default:
            break;
    }
}

function send(str: string) {
    // var buf = new ArrayBuffer(str.length);
    // var bufView = new Uint8Array(buf);
    // for (var i = 0, strLen = str.length; i < strLen; i++) {
    //     bufView[i] = str.charCodeAt(i);
    // }

    // //  console.log(buf);
    // var recv = String.fromCharCode.apply(null, new Uint8Array(buf));
    // //  console.log(recv); 
    connection.send(str)
}

function clientChange(params) {
    // Update the client configuration with one from params
    for (let i_group = 0; i_group < server.server.groups.length; i_group++) {
        for (let i_client = 0; i_client < server.server.groups[i_group].clients.length; i_client++) {
            if (server.server.groups[i_group].clients[i_client].id == params.id) {
                server.server.groups[i_group].clients[i_client].config = Object.assign(server.server.groups[i_group].clients[i_client].config, params);
            }
        }
    }
}

function clientConnect(params) {
    // Update all client info
    for (let i_group = 0; i_group < server.server.groups.length; i_group++) {
        for (let i_client = 0; i_client < server.server.groups[i_group].clients.length; i_client++) {
            if (server.server.groups[i_group].clients[i_client].id == params.client.id) {
                server.server.groups[i_group].clients[i_client] = params.client;
                //  console.log(server.server.groups[i_group].clients[i_client]); 
            }
        }
    }
}

function groupMute(params) {
    // Set group mute boolean
    for (let i_group = 0; i_group < server.server.groups.length; i_group++) {
        if (server.server.groups[i_group].id == params.id) {
            server.server.groups[i_group].muted = params.mute;
        }
    }
}

function groupStream(params) {
    // Set group stream id
    for (let i_group = 0; i_group < server.server.groups.length; i_group++) {
        if (server.server.groups[i_group].id == params.id) {
            server.server.groups[i_group].stream_id = params.stream_id;
        }
    }
}

function streamUpdate(params) {
    // Update all stream inforamtion
    for (let i_stream = 0; i_stream < server.server.streams.length;) {
        if (server.server.streams[i_stream].id == params.id) {
            server.server.streams[i_stream] = params.stream;
            //  console.log(server.server.streams[i_stream]); 
        }

    }
}

function show() {
    // Render the page
    var content = "";

    for (let i_group = 0; i_group < server.server.groups.length; i_group++) {
        // Set mute variables
        var classgroup;
        var unmuted;
        var mutetext;
        if (server.server.groups[i_group].muted == true) {
            classgroup = 'groupmuted';
            unmuted = 'false';
            mutetext = '&#x1F507';
        } else {
            classgroup = 'group';
            unmuted = 'true';
            mutetext = '&#128266';
        }

        // Start group div
        content += "<div id='g_" + server.server.groups[i_group].id + "' class='" + classgroup + "'>";

        // Create stream selection dropdown
        var streamselect = "<select id='stream_" + server.server.groups[i_group].id + "' onchange='setStream(\"" + server.server.groups[i_group].id + "\")' class='stream'>"
        for (let i_stream = 0; i_stream < server.server.streams.length; i_stream++) {
            var streamselected = "";
            if (server.server.groups[i_group].stream_id == server.server.streams[i_stream].id) {
                streamselected = 'selected'
            }
            streamselect += "<option value='" + server.server.streams[i_stream].id + "' " + streamselected + ">" + server.server.streams[i_stream].id + ": " + server.server.streams[i_stream].status + "</option>";
        }

        streamselect += "</select>";
        content += streamselect;

        // Group mute and refresh button
        content += " <a href=\"javascript:setMuteGroup('" + server.server.groups[i_group].id + "','" + unmuted + "');\" class='mutebuttongroup'>" + mutetext + "</a>";
        content += "<input type='button' value='Refresh' class='refreshbutton' onclick='javascript: location.reload()'>";
        content += "<br/>";

        // Create clients in group
        for (let i_client = 0; i_client < server.server.groups[i_group].clients.length; i_client++) {
            var sv = server.server.groups[i_group].clients[i_client];

            // Set name and connection state vars, start client div
            var name;
            var clas = 'client'
            if (sv.config.name != "") {
                name = sv.config.name;
            } else {
                name = sv.host.name;
            }
            if (sv.connected == false) {
                clas = 'disconnected';
            }
            content = content + "<div id='c_" + sv.id + "' class='" + clas + "'>";

            // Client mute status vars
            var unmuted;
            var mutetextclient;
            var sliderclass;
            if (sv.config.volume.muted == true) {
                unmuted = 'false';
                sliderclass = 'slidermute';
                mutetext = '&#128263';
            } else {
                sliderclass = 'slider'
                unmuted = 'true';
                mutetext = '&#128266';
            }

            // Client group selection vars
            var groupselect = "<select id='group_" + sv.id + "' onchange='setGroup(\"" + sv.id + "\")'>";
            for (let o_group = 0; o_group < server.server.groups.length; o_group++) {
                var groupselected = "";
                if (o_group == i_group) {
                    groupselected = 'selected'
                }
                groupselect = groupselect + "<option value='" + server.server.groups[o_group].id + "' " + groupselected + ">Group " + o_group + " (" + server.server.groups[o_group].clients.length + " Clients)</option>";
            }

            groupselect = groupselect + "<option value='new'>new</option>";
            groupselect = groupselect + "</select>"

            // Populate client div
            content = content + " <a href=\"javascript:setVolume('" + sv.id + "','" + unmuted + "');\" class='mutebutton'>" + mutetext + "</a>";
            content = content + "<div class='sliders'><div class='sliderdiv'><input type='range' min=0 max=100 step=1 id='vol_" + sv.id + "' onchange='javascript:setVolume(\"" + sv.id + "\",\"" + sv.config.volume.muted + "\")' value=" + sv.config.volume.percent + " class='" + sliderclass + "' orient='vertical'></div>";
            content = content + "<div class='finebg'>++<br>+<br>0<br>-<br>--</div><div class='sliderdiv_fine'><input type='range' min=0 max=10 step=1 id='vol_fine_" + sv.id + "' onchange='javascript:setVolume(\"" + sv.id + "\",\"" + sv.config.volume.muted + "\")' value=5 class='" + sliderclass + "_fine' orient='vertical'></div></div>";
            content = content + " <a href=\"javascript:setName('" + sv.id + "');\" class='edit'>&#9998</a>";
            content = content + name;
            content = content + groupselect;
            content = content + "</div>";
        }

        content = content + "</div>"
    }

    // Pad then update page
    content = content + "<br><br>";
    document.getElementById('show').innerHTML = content;
}

function setVolume(id, mute) {
    percent = document.getElementById('vol_' + id).value;
    percent_fine = document.getElementById('vol_fine_' + id).value;

    // Take away 5 as it's the default of the fine slider. Only relevant if it
    // has changed
    percent = Number(percent) + Number(percent_fine) - 5;

    if (percent < 0) {
        percent = 0
    }
    else if (percent > 100) {
        percent = 100
    }

    // Request changes
    send('{"id":8,"jsonrpc":"2.0","method":"Client.SetVolume","params":{"id":"' + id + '","volume":{"muted":' + mute + ',"percent":' + percent + '}}}')

    // Make updates to server info and refresh content
    for (let i_group = 0; i_group < server.server.groups.length; i_group++) {
        for (let i_client = 0; i_client < server.server.groups[i_group].clients.length; i_client++) {
            var sv = server.server.groups[i_group].clients[i_client];
            if (sv.id == id) {
                if (mute == 'true') {
                    sv.config.volume.muted = true;
                }
                if (mute == 'false') {
                    sv.config.volume.muted = false;
                }
                sv.config.volume.percent = percent;
            }
        }
    }
    show()
}

function setMuteGroup(id, what) {
    send('{"id":"MuteGroup_' + id + '","jsonrpc":"2.0","method":"Group.SetMute","params":{"id":"' + id + '","mute":' + what + '}}')

    for (let i_group = 0; i_group < server.server.groups.length; i_group++) {
        if (server.server.groups[i_group].id == id) {
            if (what == 'true') {
                server.server.groups[i_group].muted = true;
            }
            if (what == 'false') {
                server.server.groups[i_group].muted = false;
            }
            //  console.log(server.server.groups[i_group]); 
        }
    }
    show()
}

function setStream(id) {
    send('{"id":4,"jsonrpc":"2.0","method":"Group.SetStream","params":{"id":"' + id + '","stream_id":"' + document.getElementById('stream_' + id).value + '"}}')

    for (let i_group = 0; i_group < server.server.groups.length; i_group++) {
        if (server.server.groups[i_group].id == id) {
            server.server.groups[i_group].stream_id = document.getElementById('stream_' + id).value;
            //  console.log(server.server.groups[i_group]); 
        }
    }
    show()
}

function setGroup(id) {
    group = document.getElementById('group_' + id).value;

    // Get client group id
    var current_group;
    groups:
    for (let i_group = 0; i_group < server.server.groups.length; i_group++) {
        for (let i_client = 0; i_client < server.server.groups[i_group].clients.length; i_client++) {
            if (id == server.server.groups[i_group].clients[i_client].id) {
                current_group = server.server.groups[i_group].id;
                break groups;
            }
        }
    }

    // Get
    //   List of target group's clients
    // OR
    //   List of current group's other clients
    var send_clients = [];
    for (let i_group = 0; i_group < server.server.groups.length; i_group++) {
        if (server.server.groups[i_group].id == group || (group == "new" && server.server.groups[i_group].id == current_group)) {
            for (let i_client = 0; i_client < server.server.groups[i_group].clients.length; i_client++) {
                if (group == "new" && server.server.groups[i_group].clients[i_client].id == id) { }
                else {
                    send_clients[send_clients.length] = server.server.groups[i_group].clients[i_client].id;
                }
            }
        }
    }

    if (group == "new") {
        group = current_group
    }
    else {
        send_clients[send_clients.length] = id;
    }

    var send_clients_string = JSON.stringify(send_clients);
    send('{"id":1,"jsonrpc":"2.0","method":"Group.SetClients","params":{"clients":' + send_clients_string + ',"id":"' + group + '"}}')
}

function setName(id) {
    // Get current name and lacency
    var current_name;
    var current_latency;
    groups:
    for (let i_group = 0; i_group < server.server.groups.length; i_group++) {
        for (let i_client = 0; i_client < server.server.groups[i_group].clients.length; i_client++) {
            var sv = server.server.groups[i_group].clients[i_client];
            if (sv.id == id) {
                if (sv.config.name != "") {
                    current_name = sv.config.name;
                } else {
                    current_name = sv.host.name;
                }
                current_latency = sv.config.latency;
                break groups;
            }
        }
    }

    var newName = window.prompt("New Name", current_name);
    var newLatency = window.prompt("New Latency", current_latency);

    // Don't change anything if user cancel's
    if (newName != null) {
        send('{"id":6,"jsonrpc":"2.0","method":"Client.SetName","params":{"id":"' + id + '","name":"' + newName + '"}}')
    } else {
        newName = current_name
    }
    if (newLatency != null) {
        send('{"id":7,"jsonrpc":"2.0","method":"Client.SetLatency","params":{"id":"' + id + '","latency":' + newLatency + '}}')
    } else {
        newLatency = current_latency
    }

    for (let i_group = 0; i_group < server.server.groups.length; i_group++) {
        for (let i_client = 0; i_client < server.server.groups[i_group].clients.length; i_client++) {
            var sv = server.server.groups[i_group].clients[i_client];
            if (sv.id == id) {
                sv.config.name = newName;
                sv.config.latency = newLatency;
            }
        }
    }
    show()
}
