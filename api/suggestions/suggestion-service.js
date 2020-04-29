const SubtitleModel = require('../subtitles/subtitle-model')

const addSuggestion = async (dialogueId, { suggestion }) => {
    console.info('Adicionando nova sugestão')

    const subtitle = await SubtitleModel.findOne({'dialoguesMap._id': dialogueId})
    const dialogue = subtitle.dialoguesMap.filter(({_id}) => _id == dialogueId)[0]
    const suggestions = dialogue.suggestions

    // Adiciona a sugestão
    suggestions.unshift({ text: suggestion })
    dialogue.suggestions = [...(new Set(suggestions))]

    // Build do conteudo
    subtitle.buildContentBasedOnSuggestions()

    // Persiste na base
    await subtitle.save()

    return Promise.resolve(dialogue.suggestions)
}

const getDialoguesToImproveSuggestions = async ({language, page, skip = 0 }) => {
    console.info('Buscando legenda para sugerir')

    const subtitle = await SubtitleModel
        .find({language}, { dialoguesMap: { $slice: getPage(page)} })
        .select('dialoguesMap.original dialoguesMap.suggestions dialoguesMap._id')
        .sort({ createdAt: -1 })
        .limit(1)
        .skip(parseInt(skip))
        .lean()
    
    const dialogues = subtitle.length ? subtitle[0].dialoguesMap : []

    return Promise.resolve(dialogues)
}

const getPage = (page = 0) => [0 + (page * 20), 20 + (page * 20)]

module.exports = {
    addSuggestion,
    getDialoguesToImproveSuggestions
}