# floaty-eye-thingies

A browser game poem about the little floaty things inside your eyes.

Look into the light and you'll find them — the faint strands and clusters that
drift across your vision. The whole piece rests on one true detail: you can
never look straight at a floater. The moment your gaze settles on one, it
slides away. Here, your pointer (or fingertip) is your gaze, and the floaters
keep the same shyness.

There's nothing to win. Just look.

## Run it

No build step, no dependencies — it's plain HTML, CSS, and Canvas. Open
`index.html` directly, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Controls

- **Desktop:** move the mouse. Your cursor is your gaze; floaters drift away
  from it.
- **Mobile:** drag a finger across the screen.

## Files

- `index.html` — the page and the poem text
- `style.css` — the bright field and the surfacing words
- `main.js` — the floaters, their wander, and their shyness toward the gaze
