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
            ingredient-profile(:ingredient="ingredientData" @update="updateProfile" @updateWithImage="updateProfileWithImage")
        div.Ingredients_ArticleWrapper
            div.Ingredients_ArticleLabel
                span.Ingredients_ArticleLabelText Article_japanese
                el-button(type="primary" style="height: 40px;" @click="showCreateModal('japanese')") Create
            div.Ingredients_ArticleContainer
                div(v-if="articleJpList.length == 0") Nothing
                article-card(v-for="(article, index) in articleJpList"
                            :key="index"
                            lang="japanese"
                            :article="article"
                            @click.native="showEditModal(article)"
                            class="Ingredients_ArticleCard")
        div.Ingredients_ArticleWrapper
            div.Ingredients_ArticleLabel
                span.Ingredients_ArticleLabelText Article_english
                el-button(type="primary" style="height: 40px;" @click="showCreateModal('english')") Create
            div.Ingredients_ArticleContainer
                div(v-if="articleEnList.length == 0") Nothing
                article-card(v-for="(article, index) in articleEnList"
                            :key="index"
                            lang="english"
                            :article="article"
                            @click.native="showEditModal(article)"
                            class="Ingredients_ArticleCard")
        article-create-modal(v-show="isActiveCreateModal" :lang="modalType" @create="createArticle" @close="closeCreateModal")
        article-edit-modal(v-show="isActiveEditModal" :article="selectedArticle" :lang="modalType" @update="updateArticle" @close="closeEditModal")
</template>

<script>
import { db, firebase } from '~/plugins/firebase.js'
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
            modalType: 'japanese',
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
        let ingredientId = 0
        await db.collection('Ingredients')
            .doc(params.id)
            .get()
            .then(snapshot => {
                if(snapshot.exists) {
                    ingredient = snapshot.data()
                    ingredientId = snapshot.id
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
                article['id'] = article_id
                article['content'] = []
                db.collection(`Articles/${article_id}/sub_categories`)
                .get()
                .then(snapshot_categories => {
                    snapshot_categories.forEach(function(doc) {
                        let content = doc.data()
                        content['id'] = doc.id
                        article['content'].push(content)
                    });
                })
                if(article.language == 'japanese') articleJpList.push(article)
                else articleEnList.push(article)
            })
            .catch(err => {
                console.log(err)
                alert('Error! show error details on console.')
            })
        });
        return {
            ingredientId: ingredientId,
            ingredientData: ingredient,
            articleJpList: articleJpList,
            articleEnList: articleEnList
        }
    },
    methods: {
        updateProfile(profile) {
            this.loadingToClass('IngredientProfile_UpdataButton', '#ffffff80')
            db.collection("Ingredients").doc(this.ingredientId).update(profile)
            .then(() => {
                this.ingredientData = profile
                this.isSuccess = true
                setTimeout(() => {
                    this.isSuccess= false
                }, 3500)
                this.loadingStop()
            })
            .catch(error => {
                alert(error)
                console.log(error)
            })
        },
        updateProfileWithImage(payload){
            let profile = payload.profile
            let image = payload.image
            var storageRef = firebase.storage().ref();
            let ref = storageRef.child(`ingredients/${profile.name}.jpg`)

            ref.put(image)
            .then((snapshot)=> {
                console.log('Uploaded a blob or file!');
                ref.getDownloadURL().then((url) => {
                    profile.image_url = url
                    this.updateProfile(profile)
                });
            }).catch(error => {
                console.log(error)
                alert('Error! show error details on console.')
            })
        },
        updateArticle(article) {
            this.loadingToClass('ArticleEditModal_SubmitButton', '#ffffff80')
            db.collection('Articles').doc(article.id).update({
                'title': article.title
            }).then(()=> {
                article.sub_categories.forEach(category => {
                    let category_copy = JSON.parse(JSON.stringify(category))
                    if(category.hasOwnProperty('id')) {
                        delete category_copy.id
                        db.collection(`Articles/${article.id}/sub_categories`).doc(category.id).update(category_copy)
                    }else{
                        db.collection(`Articles/${article.id}/sub_categories`).add(category)
                    }
                })
                this.isSuccess = true
                setTimeout(() => {
                    this.isSuccess= false
                }, 3500)
                this.loadingStop()
                this.closeCreateModal()
                window.location.reload(true)
            }).catch((error) => {
                alert(error)
                this.loadingStop()
                console.log(error)
                console.error('Error! show error details on console.');
            });

        },
        createArticle(article) {
            console.log(article)
            let articleProfile = article.profile
            articleProfile['ingredient_id'] = this.ingredientId

            this.loadingToClass('ArticleCreateModal_SubmitButton', '#ffffff80')

            db.collection("Articles").add(articleProfile)
            .then((docRef) => {
                let articles_ids = this.ingredientData.articles_ids
                articles_ids.push(docRef.id)

                article.sub_categories.forEach(category => {
                    db.collection(`Articles/${docRef.id}/sub_categories`).add(category)
                })

                db.collection('Ingredients').doc(this.ingredientId).update({
                    'articles_ids': articles_ids
                }).then(()=> {
                    this.isSuccess = true
                    setTimeout(() => {
                        this.isSuccess= false
                    }, 3500)
                    this.loadingStop()
                    this.closeCreateModal()
                    window.location.reload(true)
                })
            })
            .catch((error) => {
                alert(error)
                this.loadingStop()
                console.error("Error adding document: ", error);
            });

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