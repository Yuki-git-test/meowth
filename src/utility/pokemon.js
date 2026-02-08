import { config } from "../config.js";
import { pokemonDex } from "../dex/pokemonDex.js";
import { goldenForm } from "../dex/goldenForm.js";
import { gmaxForm, shinyGmaxForm } from "../dex/gmax.js"; // Import các form Gmax
import axios from "axios";
import path from 'node:path';
import fs from 'fs';
import { pokemon, formPokemon, formShinyPokemon } from "../dex/pokemon.js"; // Import các đối tượng gif

/**
 * Get embed color
 * @param {*} rarity 
 * @returns 
 */
export function getEmbedColor(rarity) {
    switch (rarity.toLowerCase()) {
        case 'legendary':
            return config.auction.rarityEmbedColor.legendary; // Purple
        case 'shiny':
            return config.auction.rarityEmbedColor.shiny;
        case 'shiny mega':
            return config.auction.rarityEmbedColor["shiny mega"];
        case 'shiny gmax':
            return config.auction.rarityEmbedColor["shiny gmax"]; // Pink
        case 'form':
            return config.auction.rarityEmbedColor.form;
        case 'shiny form':
                return config.auction.rarityEmbedColor.form;    
        case 'gmax':
            return config.auction.rarityEmbedColor.gmax;
        case 'mega':
            return config.auction.rarityEmbedColor.mega; // Green
        case 'bulk':
            return config.auction.rarityEmbedColor.bulk; // Blue
        case 'exclusive':
            return config.auction.rarityEmbedColor.form; // Red
        case 'golden':
        case 'golden form':
            return config.auction.rarityEmbedColor.golden; // Golden
        default:
            return '#FFFFFF'; // Default color (white)
    }
}

/**
 * Get pokemon's gif image
 * @param {*} pokemonName 
 * @param {*} rarity 
 * @returns 
 */
export async function getPokemonGif(pokemonName, rarity) {
    let baseUrl;
    let gifUrl;
    let isLocal = false;

    switch (rarity.toLowerCase()) {
        case 'shiny':
            if (formShinyPokemon[pokemonName.toLowerCase()]) {
                gifUrl = formShinyPokemon[pokemonName.toLowerCase()]; // Sử dụng URL từ formShinyPokemon
            } else {
                baseUrl = 'https://play.pokemonshowdown.com/sprites/ani-shiny/';
                gifUrl = `${baseUrl}${pokemonName}.gif`;
            }
            break;
            case 'bulk': 
            gifUrl = 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMno3cjV3MGt6eXJpa2JuYW45MXlyZXR2MjYzaXgxOXZ5MGQyZnJrcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Dnj7MhJcGEcEoK3qIW/giphy.gif';
            break;
        case 'form':
            if (formPokemon[pokemonName.toLowerCase()]) {
                gifUrl = formPokemon[pokemonName.toLowerCase()]; // Sử dụng URL từ formPokemon
            } else {
                baseUrl = 'https://play.pokemonshowdown.com/sprites/ani/';
                gifUrl = `${baseUrl}${pokemonName}.gif`;
            }
            break;
        case 'shiny form':
            if (formShinyPokemon[pokemonName.toLowerCase()]) {
                gifUrl = formShinyPokemon[pokemonName.toLowerCase()]; // Sử dụng URL từ formShinyPokemon
            } else {
                baseUrl = 'https://play.pokemonshowdown.com/sprites/ani-shiny/';
                gifUrl = `${baseUrl}${pokemonName}.gif`;
            }
            break;
        case 'mega':
            baseUrl = 'https://play.pokemonshowdown.com/sprites/ani/';
            if (pokemonName.toLowerCase() === 'mewtwo-y') {
                gifUrl = `${baseUrl}mewtwo-megay.gif`;  
            } else if (pokemonName.toLowerCase() === 'mewtwo-x') {
                gifUrl = `${baseUrl}mewtwo-megax.gif`;
            } else if (pokemonName.toLowerCase() === 'charizard-x') {
                gifUrl = `${baseUrl}charizard-megax.gif`;
            } else if (pokemonName.toLowerCase() === 'charizard-y') {
                gifUrl = `${baseUrl}charizard-megay.gif`;
            } else {
                gifUrl = `${baseUrl}${pokemonName}-mega.gif`;
            }
            break;  
        case 'shiny mega':
            baseUrl = 'https://play.pokemonshowdown.com/sprites/ani-shiny/';
            if (pokemonName.toLowerCase() === 'mewtwo-y') {
                gifUrl = `${baseUrl}mewtwo-megay.gif`;  
            } else if (pokemonName.toLowerCase() === 'mewtwo-x') {
                gifUrl = `${baseUrl}mewtwo-megax.gif`;
            } else if (pokemonName.toLowerCase() === 'charizard-x') {
                gifUrl = `${baseUrl}charizard-megax.gif`;
            } else if (pokemonName.toLowerCase() === 'charizard-y') {
                gifUrl = `${baseUrl}charizard-megay.gif`;
            } else {
                gifUrl = `${baseUrl}${pokemonName}-mega.gif`;
            }
            break;            
        case 'gmax':
            if (gmaxForm[pokemonName.toLowerCase()]) {
                gifUrl = gmaxForm[pokemonName.toLowerCase()]; // Sử dụng URL đặc biệt
            } else {
                baseUrl = 'https://play.pokemonshowdown.com/sprites/ani/';
                gifUrl = `${baseUrl}${pokemonName}-gmax.gif`;
            }
            break;
        case 'shiny gmax':
            if (shinyGmaxForm[pokemonName.toLowerCase()]) {
                gifUrl = shinyGmaxForm[pokemonName.toLowerCase()]; // Sử dụng URL đặc biệt
            } else {
                baseUrl = 'https://play.pokemonshowdown.com/sprites/ani-shiny/';
                gifUrl = `${baseUrl}${pokemonName}-gmax.gif`;
            }
            break;
        case 'golden':
            const dex = pokemonDex[pokemonName];

            if (!dex) {
                return { url: "https://play.pokemonshowdown.com/sprites/ani/missingno.gif", isLocal: false };
            }
            baseUrl = 'https://graphics.tppcrpg.net/xy/golden/';
            gifUrl = `${baseUrl}${dex}M.gif`;
            break;
        case 'golden form':
            gifUrl = goldenForm[pokemonName];
            if (gifUrl) {
                isLocal = false;
            } else {
                gifUrl = path.join(process.cwd(), 'src', 'images', `${pokemonName}.gif`);
                isLocal = true;
            }
            break;
        default:
            if (pokemon[pokemonName.toLowerCase()]) {
                gifUrl = pokemon[pokemonName.toLowerCase()]; // Sử dụng URL từ pokemon.js
            } else {
                baseUrl = 'https://play.pokemonshowdown.com/sprites/ani/';
                gifUrl = `${baseUrl}${pokemonName}.gif`;
            }
            break;
    }

    // check asset exists
    try {
        if (isLocal) {
            await fs.promises.access(gifUrl);
        } else {
            await axios.get(gifUrl);
        }
        return { url: gifUrl, isLocal };
    } catch (error) {
        console.log('Error: ' + error);
        return { url: "https://play.pokemonshowdown.com/sprites/ani/missingno.gif", isLocal: false, message: '' };
    }
}