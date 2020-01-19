<template lang="pug">
    div.Ingredients
        div.Ingredients_Container
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
                                @delete="deleteArticle(article.id)"
                                @show="showEditModal(article)"
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
                                @delete="deleteArticle(article.id)"
                                @show="showEditModal(article)"
                                class="Ingredients_ArticleCard")
            div.Ingredients_InfoItem
                h2.Ingredients_ItemLabel Delete this Ingrerdient
                el-button(type="danger" plain @click="deleteIngredientCnfirm") Delete
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
  components: {
    ArticleCard,
    ArticleCreateModal,
    ArticleEditModal,
    IngredientProfile
  },
  mixins: [loading],
  data () {
    return {
      isActiveCreateModal: false,
      isActiveEditModal: false,
      selectedArticle: {},
      modalType: 'japanese',
      isSuccess: false // Where firestore action is success
    }
  },
  async asyncData (context) {
    // Get this ingredient data
    let ingredient = {}
    let ingredientId = 0
    const id = context.query.id
    await db.collection('Ingredients')
      .doc(id)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          ingredient = snapshot.data()
          ingredientId = snapshot.id

          ingredient.seasons = ingredient.seasons.slice(0, 12)
        }
      })
      .catch((error) => {
        alert('This ingredient is nothing!')
        console.log(error)
        context.redirect('/')
      })
    // Get article List of this ingredient
    const articleJpList = []
    const articleEnList = []
    try {
      await db.collection('Articles')
        .where('ingredient_id', '==', ingredientId)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((articleDoc) => {
            const article = articleDoc.data()
            article.id = articleDoc.id
            article.content = []
            db.collection(`Articles/${article.id}/sub_categories`)
              .get()
              .then((snapshotCategories) => {
                snapshotCategories.forEach(function (subCategoryDoc) {
                  const content = subCategoryDoc.data()
                  content.id = subCategoryDoc.id
                  article.content.push(content)
                })
              })
            if (article.language == 'japanese') {
              articleJpList.push(article)
            } else {
              articleEnList.push(article)
            }
          })
        })
        .catch((err) => {
          console.log(err)
          alert('Error! show error details on console.')
        })
    } catch (error) {
      alert('This ingredient is nothing!')
      console.log(error)
      context.redirect('/')
    }
    return {
      ingredientId,
      ingredientData: ingredient,
      articleJpList,
      articleEnList
    }
  },
  async fetch ({ store }) {
    await store.dispatch('subCategories/getSubCategories')
  },
  methods: {
    async updateProfile (profile) {
      this.loadingToClass('IngredientProfile_UpdataButton', '#ffffff80')
      await db.collection('Ingredients').doc(this.ingredientId).update(profile)
        .then(() => {
          this.ingredientData = profile
          this.isSuccess = true
          setTimeout(() => {
            this.isSuccess = false
          }, 3500)
          this.loadingStop()
        })
        .catch((error) => {
          console.log(error)
        })
    },
    updateProfileWithImage (payload) {
      const profile = payload.profile
      const image = payload.image
      const storageRef = firebase.storage().ref()
      const ref = storageRef.child(`ingredients/${this.ingredientId}.jpg`)

      ref.put(image)
        .then((snapshot) => {
          console.log('Uploaded a blob or file!')
          ref.getDownloadURL().then((url) => {
            profile.image_url = url
            this.updateProfile(profile)
          })
        }).catch((error) => {
          console.log(error)
          alert('Error! show error details on console.')
        })
    },
    updateArticle (target) {
      const article = target.article
      const deleteIds = target.deleteIds
      this.loadingToClass('ArticleEditModal_SubmitButton', '#ffffff80')
      db.collection('Articles').doc(article.id).update({
        'title': article.title
      }).then(() => {
        article.sub_categories.forEach((category) => {
          const categoryCopy = JSON.parse(JSON.stringify(category))
          // update category
          if (category.hasOwnProperty('id')) {
            delete categoryCopy.id
            db.collection(`Articles/${article.id}/sub_categories`).doc(category.id).update(categoryCopy)
          } else {
            db.collection(`Articles/${article.id}/sub_categories`).add(category)
          }
          // delete category
          deleteIds.forEach((categoryId) => {
            db.collection(`Articles/${article.id}/sub_categories`).doc(categoryId).delete()
          })
        })
        this.isSuccess = true
        setTimeout(() => {
          this.isSuccess = false
        }, 3500)
        this.loadingStop()
        this.closeCreateModal()
        window.location.reload(true)
      }).catch((error) => {
        alert(error)
        this.loadingStop()
        console.log(error)
        console.error('Error! show error details on console.')
      })
    },
    createArticle (article) {
      const articleProfile = article.profile
      articleProfile.ingredient_id = this.ingredientId

      this.loadingToClass('ArticleCreateModal_SubmitButton', '#ffffff80')

      db.collection('Articles').add(articleProfile)
        .then((docRef) => {
          const articles_ids = this.ingredientData.articles_ids
          articles_ids.push(docRef.id)

          article.sub_categories.forEach((category) => {
            db.collection(`Articles/${docRef.id}/sub_categories`).add(category)
          })

          db.collection('Ingredients').doc(this.ingredientId).update({
            articles_ids
          }).then(() => {
            this.isSuccess = true
            setTimeout(() => {
              this.isSuccess = false
            }, 3500)
            this.loadingStop()
            this.closeCreateModal()
            window.location.reload(true)
          })
        })
        .catch((error) => {
          alert(error)
          this.loadingStop()
          console.error('Error adding document: ', error)
        })
    },
    async deleteArticle (id) {
      await this.$confirm('一度消すと復元することができません。この記事を本当に消しますか？', 'Warning', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        db.collection(`Articles/${id}/sub_categories`)
          .get()
          .then((snapshotCategories) => {
            if (snapshotCategories.empty) { return true }
            snapshotCategories.forEach((doc) => {
              db.collection(`Articles/${id}/sub_categories`).doc(doc.id).delete()
            })
            db.collection('Articles').doc(id).delete()
              .then(() => {
                const ids = this.ingredientData.articles_ids.filter((articleId) => {
                  return articleId !== id
                })
                this.ingredientData.articles_ids = ids
                this.updateProfile(this.ingredientData)
                window.location.reload(true)
                this.$message({
                  type: 'success',
                  message: 'Delete completed'
                })
              }).catch((error) => {
                alert('Error! show error details on console.')
                console.log(error)
              })
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        })
      })
    },
    async deleteIngredientCnfirm () {
      await this.$confirm('一度消すと復元することができません。この素材を本当に消しますか？', 'Warning', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.loadingToClass('Ingredients', '#ffffff80')
        db.collection(`Ingredients`).doc(this.ingredientId).delete()
          .then(() => {
            const storageRef = firebase.storage().ref()
            const ref = storageRef.child(`ingredients/${this.ingredientId}.jpg`)
            ref.delete().then(() => {
              if (this.ingredientData.articles_ids.length == 0) {
                this.loadingStop()
                this.$router.push('/')
                this.$message({
                  type: 'success',
                  message: 'Delete completed'
                })
              }
              this.ingredientData.articles_ids.forEach((articleId, index) => {
                db.collection(`Articles/${articleId}/sub_categories`)
                  .get()
                  .then((snapshotCategories) => {
                    if (snapshotCategories.empty) { return true }
                    snapshotCategories.forEach((doc) => {
                      db.collection(`Articles/${articleId}/sub_categories`).doc(doc.id).delete()
                    })
                    db.collection('Articles').doc(articleId).delete()
                      .then(() => {
                        if (index === this.ingredientData.articles_ids.length - 1) {
                          this.loadingStop()
                          this.$router.push('/')
                          this.$message({
                            type: 'success',
                            message: 'Delete completed'
                          })
                        }
                      })
                  })
              })
            }).catch((error) => {
              alert('Error! show error details on console.')
              console.log(error)
            })
          }).catch((error) => {
            alert('Error! show error details on console.')
            console.log(error)
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        })
      })
    },
    goTop () {
      this.$router.push('/')
    },
    showCreateModal (lang) {
      this.modalType = lang
      this.isActiveCreateModal = true
    },
    closeCreateModal () {
      this.isActiveCreateModal = false
    },
    showEditModal (data) {
      this.selectedArticle = data
      this.isActiveEditModal = true
    },
    closeEditModal () {
      this.isActiveEditModal = false
    }
  }
}
</script>

<style lang="scss" scoped>
.Ingredients {
    &_Container {
        padding: 50px 100px;
    }
    &_PageLink {
        margin-bottom: 50px;
    }
    &_InfoWrapper {
        display: flex;
        align-items: center;
        margin-bottom: 100px;
    }
    &_ItemLabel {
        margin-bottom: 15px;
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
