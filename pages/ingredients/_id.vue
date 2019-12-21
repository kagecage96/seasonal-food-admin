<template lang="pug">
    div.Ingredients
        el-alert(
            v-show="isSuccess"
            title="success alert"
            type="success"
            description="more text description"
            effect="dark"
            show-icon>
        )
        el-page-header(@back="goTop" title="Top" class="Ingredients_PageLink")
        div.Ingredients_InfoWrapper
            ingredient-profile(:ingredient="ingredientData" @update="updateProfile")
        div.Ingredients_ArticleWrapper
            div.Ingredients_ArticleLabel
                span.Ingredients_ArticleLabelText Article_jp
                el-button(type="primary" style="height: 40px;" @click="showCreateModal('jp')") Create
            div.Ingredients_ArticleContainer
                div(v-if="articleJpList.length == 0") Nothing
                article-card(v-for="article in articleJpList"
                            :key="article.id"
                            lang="jp"
                            :article="article"
                            @click.native="showEditModal(article)"
                            class="Ingredients_ArticleCard")
        div.Ingredients_ArticleWrapper
            div.Ingredients_ArticleLabel
                span.Ingredients_ArticleLabelText Article_en
                el-button(type="primary" style="height: 40px;" @click="showCreateModal('en')") Create
            div.Ingredients_ArticleContainer
                div(v-if="articleEnList.length == 0") Nothing
                article-card(v-for="article in articleEnList"
                            :key="article.id" lang="en"
                            :article="article"
                            @click.native="showEditModal(article)"
                            class="Ingredients_ArticleCard")
        article-create-modal(v-show="isActiveCreateModal" :lang="modalType" @close="closeCreateModal")
        article-edit-modal(v-show="isActiveEditModal" :article="selectedArticle" :lang="modalType" @close="closeEditModal")
</template>

<script>
import { db } from '~/plugins/firebase.js'
import IngredientProfile from '~/components/IngredientProfile.vue'
import ArticleCard from '~/components/ArticleCard.vue'
import ArticleCreateModal from '~/components/ArticleCreateModal.vue'
import ArticleEditModal from '~/components/ArticleEditModal.vue'

import loading from '~/assets/loading.js'

export default {
    mixins: [loading],
    data() {
        return {
            isActiveCreateModal: false,
            isActiveEditModal: false,
            selectedArticle: {},
            modalType: 'jp',
            isSuccess: false // Where firestore action is success
        }
    },
    components: {
        ArticleCard,
        ArticleCreateModal,
        ArticleEditModal,
        IngredientProfile
    },
    async asyncData ({ store, params }) {
        // Get this ingredient data
        let ingredient = {}
        let documentId = 0
        await db.collection('Ingredients')
            .doc(params.id)
            .get()
            .then(snapshot => {
                if(snapshot.exists) {
                    ingredient = snapshot.data()
                    documentId = snapshot.id
                }
            })
        // Get article List of this ingredient
        let articleJpList = []
        let articleEnList = []
        let articleSnapshot = {}
        const articleIds = ingredient.articles_ids
        await articleIds.forEach(article_id => {
            db.collection('Articles')
            .doc(article_id)
            .get()
            .then(snapshot => {
                let article = snapshot.data()
                article['content'] = []
                db.collection(`Articles/${article_id}/sub_categories`)
                .get()
                .then(snapshot => {
                    snapshot.forEach(function(doc) {
                        article['content'].push(doc.data())
                    });
                })
                if(article.language == 'japanese') articleJpList.push(article)
                else articleEnList.push(article)
            })
            .catch(err => {
                console.log(err)
                alert(err)
            })
        });
        return {
            documentId: documentId,
            ingredientData: ingredient,
            articleJpList: articleJpList,
            articleEnList: articleEnList
        }
    },
    methods: {
        updateProfile(profile) {
            this.loadingToClass('IngredientProfile_UpdataButton', '#ffffff80')
            db.collection("Ingredients").doc(this.documentId).update(profile)
            .then(() => {
                this.ingredientData = profile
                this.isSuccess = true
                setTimeout(() => {
                    this.isSuccess= false
                }, 3500)
                this.loadingStop()
            })
            .catch(err => {
                alert(err)
                console.log(err)
            })
        },
        updateArticle(ingredient) {
            // this.loadingToClass('IngredientProfile_UpdataButton', '#ffffff80')
        },
        goTop() {
            this.$router.push('/')
        },
        showCreateModal(lang) {
            this.modalType = lang
            this.isActiveCreateModal = true
        },
        closeCreateModal() {
            this.isActiveCreateModal = false
        },
        showEditModal(data) {
            this.selectedArticle = data
            this.isActiveEditModal = true
        },
        closeEditModal() {
            this.isActiveEditModal = false
        }
    }
}
</script>

<style lang="scss" scoped>
.Ingredients {
    padding: 50px 100px;
    &_PageLink {
        margin-bottom: 50px;
    }
    &_InfoWrapper {
        display: flex;
        align-items: center;
        margin-bottom: 100px;
    }
    &_ArticleWrapper {
        margin-bottom: 150px;
    }
    &_ArticleContainer {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
    &_ArticleLabelText {
        margin-right: 20px;
    }
    &_ArticleLabel {
        font-size: 20px;
        margin-bottom: 20px;
    }
    &_ArticleCard {
        width: 45%;;
        margin: 30px auto 0 0;
    }
}
</style>