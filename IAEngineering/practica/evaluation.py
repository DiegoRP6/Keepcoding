import time

CASOS = [
    {"pregunta": "A que es debil Dragonite?", "tool_esperada": "get_pokemon_info"},
    {"pregunta": "Que tipo es Tyranitar?", "tool_esperada": "get_pokemon_info"},
    {"pregunta": "Que movimientos aprende Charizard?", "tool_esperada": "get_pokemon_moves"},
    {"pregunta": "Tengo una raid de Rayquaza, que uso?", "tool_esperada": "get_pokemon_info"},
    {"pregunta": "Cuales son los stats base de Metagross?", "tool_esperada": "get_pokemon_info"},
    {"pregunta": "Dime algun ataque que aprenda Gengar", "tool_esperada": "get_pokemon_moves"},
    {"pregunta": "Que counters uso contra una raid de Groudon?", "tool_esperada": "get_pokemon_info"},
    {"pregunta": "Que es una incursion en Pokemon GO?", "tool_esperada": None},
    {"pregunta": "Cuantos jugadores hacen falta para una raid de 5 estrellas?", "tool_esperada": None},
]


def evaluar(agente):
    """Lanza el agente sobre cada caso y devuelve los resultados."""
    resultados = []
    for caso in CASOS:
        inicio = time.time()
        salida = agente.invoke({"messages": [{"role": "user", "content": caso["pregunta"]}]})
        duracion = round(time.time() - inicio, 2)

        tools_usadas = []
        for mensaje in salida["messages"]:
            if mensaje.type == "tool":
                tools_usadas.append(mensaje.name)

        # Acierta si la tool esperada se uso (o si no se esperaba ninguna y no uso ninguna)
        if caso["tool_esperada"] is None:
            correcto = len(tools_usadas) == 0
        else:
            correcto = caso["tool_esperada"] in tools_usadas

        respuesta = salida["messages"][-1].content
        if len(respuesta) > 120:
            respuesta = respuesta[:120] + "..."

        resultados.append({
            "pregunta": caso["pregunta"],
            "tool_esperada": caso["tool_esperada"] or "(ninguna)",
            "tools_usadas": ", ".join(tools_usadas) or "(ninguna)",
            "correcto": correcto,
            "duracion_s": duracion,
            "respuesta": respuesta,
        })
    return resultados


def accuracy(resultados):
    """Porcentaje de casos en los que el agente eligio bien las tools."""
    aciertos = sum(1 for r in resultados if r["correcto"])
    total = len(resultados)
    return {
        "aciertos": aciertos,
        "total": total,
        "accuracy": round(aciertos / total, 2) if total else 0.0,
    }
