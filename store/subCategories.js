import { db } from '~/plugins/firebase.js'

export const state = {
    subCategories: []
};
export const actions = {
    async getSubCategories({ commit }) {
        let sub_categories = []
        await db.collection('SubCategories')
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(function(doc) {
                    let subCategoryData = doc.data()
                    subCategoryData['id'] = doc.id
                    sub_categories.push(subCategoryData)
                });
                commit('setSubCategories', sub_categories)
            })
            .catch(error=> {
                console.log(error)
                alert('Error! show error details on console.')
            })
    },
};

export const mutations = {
    setSubCategories(state, subCategories) {
        // Fix issue where facebook logout does not work
        state.subCategories = subCategories
    },
};
export const getters = {
    subCategories(state) {
        return state.subCategories
    },
}