import requests
from langchain_core.tools import tool

API = "https://pokeapi.co/api/v2"


@tool
def get_pokemon_info(name: str) -> str:
    """Tipos y stats base de un Pokemon."""
    datos = requests.get(f"{API}/pokemon/{name.lower()}").json()

    tipos = []
    for t in datos["types"]:
        tipos.append(t["type"]["name"])

    stats = {}
    for s in datos["stats"]:
        stats[s["stat"]["name"]] = s["base_stat"]

    return f"{name.capitalize()} | tipos: {', '.join(tipos)} | stats: {stats}"


@tool
def get_pokemon_moves(name: str) -> str:
    """Muestra de movimientos que aprende un Pokemon."""
    datos = requests.get(f"{API}/pokemon/{name.lower()}").json()

    muestra = []
    for m in datos["moves"][:12]:
        muestra.append(m["move"]["name"])

    total = len(datos["moves"])
    return f"{name.capitalize()} aprende {total} movimientos. Algunos: {', '.join(muestra)}"


HERRAMIENTAS = [get_pokemon_info, get_pokemon_moves]
