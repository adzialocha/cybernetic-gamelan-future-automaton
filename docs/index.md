# Cybernetic Gamelan Future Automaton

### Network-based browser game for human laptop performers

Play the [Cybernetic Gamelan Future Automaton](/play) or watch a [video](https://www.youtube.com/watch?v=qc2i82y4oS0) here.

Read the instructions below to learn how to fly in the Galaxy and how to make sounds - alone or together with other players.

*Please note: The game is relatively heavy on your computer! Make sure you have a modern machine with the latest browser version installed - otherwise some glitches might occur. Tested with Google Chrome 64, Firefox 57 (recommended), Safari 11 on a MacBook Pro 13" 2015.*

![Galaxy](/assets/images/galaxy.jpg)

## How to play

Go to [Cybernetic Gamelan Future Automaton](/play) and wait until the page loaded. Change the window to full-screen if you want and click the *Start* button (you can press `[ESC]` to leave the game again).

Your friends should do the same with their laptops if you want to play together in the same room.

### Galaxy

You find yourself in the *Galaxy* now. Use your `Touch-Pad` or `Mouse` to move your head around!

You can travel through the Galaxy via your `[W]` (forwards), `[S]` (backwards), `[A]` (left), `[D]` (right) or arrow-keys `[↑]` `[↓]` `[←]` `[→]` on your keyboard.

### Gamelan

Press `[Enter]` to enable the *Input-Mode*, you will see a blinking cursor now in the bottom-left corner of your screen.

You can enter patterns like for example `_+ :*<<` or `..///-->°` to play your Cybernetic Gamelan Future Instrument. Enter these symbols in the input field and hit `[Enter]` again to start the sound.

The Cybernetic Gamelan Future Instrument can play five different notes with the following symbols: `.` `-` `_` `/` and `:` (dot, minus, underscore, slash and colon). A regular whitespace `[Space]` indicates a pause in your pattern.

You can only enter 11 notes maximum! Otherwise the pattern will turn red to indicate that something is wrong.

Press `[Enter]` again to go back to Input-Mode. Hold a note as long as possible with using the symbol `+` right after it. For example: `/+ .+` holds the two notes `/` and `.` - Try around a little bit to hear the difference!

You can experiment now with the following symbols: `>` (speed up the whole pattern) or `<` (slow down the whole pattern). Use more arrows if you want to slow down even more (like `<<<`). Please note that you can only speed up once and slow down three times maximum.

There is more you can do! Use the symbol `*` to make the pattern sound one octave higher, or use the symbol `°` to make it an octave lower. You can go one octave up maximum and three octaves down maximum (for example `°°°`).

Don't forget pressing `[Enter]` to commit your changes to the pattern so you can hear it!

### Planets

The Galaxy consists of four *Planets*. When flying through the Galaxy you will hear the default **BELL** sound. When entering a Planet your sound will change! Travel to different Planets to explore different sounds.

All sounds behave differently depending on how fast or slow or in what octave you play them. Also your position inside the Planet changes the sound a little bit!

![Core Planet](/assets/images/planet-core.jpg)

<p style="text-align: center; padding-bottom: 40px;">
  *Core* Planet **SPACE** sound
</p>

![Allobrain Planet](/assets/images/planet-allobrain.jpg)

<p style="text-align: center; padding-bottom: 40px;">
  *Allobrain* Planet **GLOCKENSPIEL** sound
</p>

![Parametric Planet](/assets/images/planet-parametric.jpg)

<p style="text-align: center; padding-bottom: 40px;">
  *Parametric* Planet **GUITAR** sound
</p>

![Cones Planet](/assets/images/planet-cones.jpg)

<p style="text-align: center; padding-bottom: 40px;">
  *Cones* Planet **PING** sound
</p>

### Extras

Use `[Caps-Lock]` to keep automatically moving forwards. Hit it again to disable this mode.

You can also use the shortcut combination `[Command]` + `[Shift]` + `[V]` to reset your current position to the original one. This might be helpful if you get lost in the Galaxy.

## Setup

This game can be played online and offline. It is recommended to use an offline version if you plan a concert with this piece.

Use external projectors and a PA to show your audience what you are doing. The best way of course is to have one projector and speaker per laptop.

The safest way to perform this game is to use a local network. For setting this up you might need to be familiar with command line tools and JavaScript development. Check the development chapter below for further steps.

The game has a *Settings view* which you can reach through the shortcut `[Shift]` + `[2]`. Here you can customise the server settings according to your individual network setup. You get back to the *Main view* via `[Shift]` + `[1]`.

## About

*"... soft thought is not there to be understood as a new cognitive function or as a transcendent form of rationality, but to reveal that programming culture is infected by incomputable thoughts that are yet to be accounted for."* (Luciana Parisi)

The Cybernetic Gamelan Future Automaton is a network-based browser game for human laptop performers, developed by [Andreas Dzialocha](https://andreasdzialocha.com). Each performer controls its own future-gamelan instrument using text symbols while travelling inside a 3D universe of parametric architectures, visualizing how algorithms generate and represent knowledge.

## Development

The Cybernetic Gamelan Future Automaton was developed in ES6 JavaScript utilising the WebAudio API and WebGL API working with [three.js](https://threejs.org) for 3D rendering and [osc-js](https://github.com/adzialocha/osc-js) for network communication.

The source code is available on [github](https://github.com/adzialocha/cybernetic-gamelan-future-automaton). Check the according *README.md* file for setup on your machine.
