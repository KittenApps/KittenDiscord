#!/usr/bin/env node

import RPC from 'discord-rpc';
import meow from 'meow';
import url from 'node:url';
import fs from 'node:fs';

const cli = meow(`
	Usage
	  $ kittendiscord <username>

	Options
	  --lock, -l      The lockId to show (defaults to first lock)
	  --shared, -s    Your shared link for voting (optional)
      --interval, -i  Update interval in seconds (defaults to 60, min 5)

	Examples
	  $ kittendiscord Silizia -s https://chaster.app/sessions/secret
`, {
	importMeta: { url: url.pathToFileURL(fs.realpathSync(process.argv[1])).href },
    allowUnknownFlags: false,
	flags: {
		lock: {
			type: 'string',
			alias: 'l'
		},
		shared: {
			type: 'string',
			alias: 's'
		},
        interval: {
            type: 'number',
			alias: 'i',
            default: 60
        }
	}
});

const username = cli.input[0];
if (!username){
    console.log('ERROR: No username specified');
    cli.showHelp();
}
const lock = cli.flags.lock;
if (lock && !/^[0-9a-f]{24}$/.test(lock)){
    console.log('ERROR: Invalid lockId');
    cli.showHelp();
}
const shared = cli.flags.shared;
if (shared && !/^https:\/\/chaster.app\/sessions\/\w{16}$/.test(shared)){
    console.log('ERROR: Invalid shared link url');
    cli.showHelp();
}

if (cli.flags.interval < 5 ){
    console.log('ERROR: The minimum interval is 5 secs (Discord rate limit)');
    cli.showHelp();
}

const client = new RPC.Client({ transport: 'ipc' });
const clientId = '756771101857546300';
let snowflake;

const userID = fetch(`https://api.chaster.app/users/profile/${username}`).then(d => d.json()).then(d => {
    if (d.discordId && d.discordId != snowflake) {
        console.log('ERROR: The Chaster users linked Discord account doesn\'t match yours!');
        process.exit(1);
    }
    return d._id;
});

const pad = (n) => n < 10 ? `0${Math.floor(n)}` : Math.floor(n);

const setActivity = (uid, client) => fetch(`https://api.chaster.app/locks/user/${uid}`).then(d => d.json()).then(d => {
    process.stdout.write('*');
    let data;
    if (lock){
        data = d.find(e => e._id == lock);
        if (!data){
            console.log(`ERROR: Couldn't find lock with id ${lock} for user ${username}`);
            cli.showHelp();
        }
    } else {
        data = d[0]; // default to first lock
    }

    const activity = {
        smallImageKey: 'appicon',
        smallImageText: 'Super Kitten Bot developed with ❤ by Silizia',
        details: 'frozen',
        buttons: [{ label: 'Profile', url: `https://chaster.app/user/${username}` }]
    };

    let info = '';
    if (data.endDate){
        const left = (Date.parse(data.endDate)-Date.now())/1000;
        if (data.isFrozen){
            info = ' (frozen)'
            activity.largeImageKey = 'lockfrozen';
            activity.details = `remaining time: ${Math.floor(left/(60*60*24))} days and ${pad(left/(60*60)%24)}:${pad(left/(60)%60)}:${pad(left%60)}`;
        } else {
            activity.endTimestamp = Date.parse(data.endDate);
            activity.details = `remaining time: ${Math.floor(left/(60*60*24))} days and ...`;
            activity.largeImageKey = 'lock';
        }
    } else {
        activity.startTimestamp = Date.parse(data.startDate);
        activity.details = `already locked for ${Math.floor((Date.now()-Date.parse(data.startDate))/(1000*60*60*24))} days and ...`;
        if (data.isFrozen){
            info = ' (hidden, frozen)'
            activity.largeImageKey = 'lockhiddenfrozen';
        } else {
            info = ' (hidden)'
            activity.largeImageKey = 'lockhidden';
        }
    }

    if (data.sharedLock){
        activity.largeImageText = data.sharedLock.name + info + ' ~ ' + username + ' 🔒 ' + data.keyholder.username;
    } else {
        activity.largeImageText = (data.keyholder ? 'Keyholder lock' : 'Self-lock') + info + ' ~ ' + username + (data.keyholder ? ' 🔒 ' + data.keyholder.username : '');
    }

    if (shared){
        activity.buttons.push({ label: 'Shared Link', url: shared });
    }

    /*ext = data.extensions.find(e => e.slug === 'link');
    if (ext){
        activity.state = 'votes';
        activity.partySize = 42; // ??? ... :(, silly Chaster API
        activity.partyMax = ext.config.nbVisits;
    }*/

    client.setActivity(activity);
});

client.connect(clientId).then(d => snowflake = d.user.id).then(d => client.emit('ready')).catch(console.error);

client.on('ready', () => {
    userID.then(uid => {
        setActivity(uid, client);
        console.log("Kittenlocks Discord Rich Presence integration for Chaste runnning ...")
        setInterval(() => setActivity(uid, client), cli.flags.interval * 1000);
    });
});