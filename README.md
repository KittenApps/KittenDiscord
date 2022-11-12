# KittenDiscord
Kittenlocks Discord Rich Presence integration for Chaster

<img width="344" alt="Bildschirm­foto 2022-11-12 um 23 53 09" src="https://user-images.githubusercontent.com/66546362/201497753-349f8b46-52b7-49dd-a9d6-33ff6f9ca705.png">

## Features

* shows interactive countdown of your remaining lock time (or already passed time on hidden locks)
* shows lock title and keyholder in tooltip
* shows lock frozen and timer visibility status
* shows links to your profile and optional your shared link

# Installation

## Using Node.js 18+

If you have Node.js 18+ installed, you can simply install it globally by runing `npm i -g kittendiscord@latest`.

Alternatifly you can directly execute it with `npx kittendiscord@latest <username> <additional args>` too.

## Downloading prebuild binaries

Otherwise install the latest prebuild binaries (which bundles Node.js 18) on the release page here: https://github.com/KittenApps/KittenDiscord/releases/tag/v0.3.0

# Usage

`kittendiscord <username>`

## Options

| option flag        |  description       |
| ------------- | ------------- |
| `--lock`, `-l`:    |  The lockId to show (defaults to first lock) |
| `--shared`, `-s`   |  Your shared link for voting (optional) |
| `--interval`, `-i` |  Update interval in seconds (defaults to 60, min 5) |

## Examples
`kittendiscord Silizia -s https://chaster.app/sessions/fKczkweA1D3tTZHk`