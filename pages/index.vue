<template lang="pug">
    div.Top
        div.Top_Header
            el-select(v-model="season" class="Top_SelectBox")
                el-option(
                    v-for="(season, index) in [...Array(12)]"
                    :key="index"
                    :label="String(Number(index + 1)) + '月'"
                    :value="index"
                ) {{index + 1}} 月
            el-select(v-model="location" class="Top_SelectBox")
                el-option(
                    v-for="(value, key) in prefectures"
                    :key="key"
                    :label="value"
                    :value="value"
                ) {{value}}
            el-button(type="primary" @click="showCreateModal") 新規作成
        div.Top_Body
            div.Top_Count {{filteredIngredients.length}} results
            div.Top_CardList
                div(v-for="ingredient in filteredIngredients" :key="ingredient.id" class="Top_Card")
                    nuxt-link(:to="`ingredients?id=${ingredient.id}`")
                        img(:src="ingredient.image_url" width="100px" height="100px" class="Top_CardImage")
                        div.Top_CardTitle {{ingredient.name}}
        div.Top_IngredientCreateModal
            ingredient-create-modal(
                v-show="isActiveModal"
                @create="createIngredient"
                @close="closeCreateModal")
</template>

<script>
import IngredientCreateModal from '~/components/IngredientCreateModal'

import { db, firebase } from '~/plugins/firebase.js'
import loading from '~/assets/loading.js'
import prefectures from '~/assets/prefectures.js'
import seasons from '~/assets/seasons.js'

export default {
  components: {
    IngredientCreateModal
  },
  mixins: [loading, prefectures, seasons],
  data () {
    return {
      season: 0,
      location: 'tokyo',
      ingredients: [], // Ingredients from firestore sorted by loacation
      filteredIngredients: [], //　Ingredients Filtered by js because firestore cannot filter by season
      isActiveModal: false,
      selectedIngredient: {}
    }
  },
  watch: {
    location () {
      this.getIngredients()
    },
    season () {
      this.sortIngredients()
    }
  },
  async fetch ({ store }) {
    await store.dispatch('subCategories/getSubCategories')
  },
  mounted () {
    this.getIngredients()
  },
  methods: {
    async getIngredients () {
      this.loadingToClass('Top_Body')
      // Get ingredients data from firestore
      const ingredients = []
      await db.collection('Ingredients')
        .where('locations', 'array-contains', this.location)
        .get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const ingredient = doc.data()
            ingredient.id = doc.id
            if (ingredient.seasons[this.season]) {
              ingredients.push(ingredient)
            }
          })
        }).catch((error) => {
          console.log(error)
          alert('Error! show error details on console.')
        })
      this.ingredients = ingredients
      this.filteredIngredients = ingredients.filter((ingredient) => {
        return ingredient.seasons[this.season] == true
      })
      this.loadingStop()
    },
    async createIngredient (ingredient) {
      this.loadingToClass('IngredientCreateModal_SubmitButtonContainer', '#ffffff80')
      const image = ingredient.image_url
      ingredient.image_url = ''
      this.selectedIngredient = ingredient
      await db.collection('Ingredients').add(ingredient)
        .then((docRef) => {
          this.setIngredientImage(image, docRef.id)
        })
        .catch((error) => {
          alert('Error! show error details on console.')
          console.log(error)
        })
    },
    async setIngredientImage (image, id) {
      const storageRef = firebase.storage().ref()
      const ref = storageRef.child(`ingredients/${id}.jpg`)
      await ref.put(image)
        .then((snapshot) => {
          console.log('Uploaded a blob or file!')
          ref.getDownloadURL().then((url) => {
            this.selectedIngredient.image_url = url
            this.updateProfile(this.selectedIngredient, id)
          })
        }).catch((error) => {
          console.log(error)
          alert('Error! show error details on console.')
        })
    },
    async updateProfile (profile, id) {
      await db.collection('Ingredients').doc(id).update(profile)
        .then(() => {
          this.$router.push(`/ingredients?id=${id}`)
          this.loadingStop()
        })
        .catch((error) => {
          alert('Error! show error details on console.')
          console.log(error)
        })
    },
    showCreateModal () {
      this.isActiveModal = true
    },
    closeCreateModal () {
      this.isActiveModal = false
    },
    sortIngredients () {
      this.filteredIngredients = this.ingredients.filter((ingredient) => {
        return ingredient.seasons[this.season] == true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.Top {
    display: flex;
    flex-direction: column;
    height: 100vh;
    &_Header {
        padding: 50px 50px 0;
        margin-bottom: 50px;
    }
    &_SelectBox {
        margin-right: 30px;
        &:last-of-type {
            margin-right: 50px;
        }
    }
    &_Body {
        padding: 0 50px;
        flex-grow: 1;
    }
    &_Count {
        margin-bottom: 50px;
    }
    &_CardList {
        display: flex;
        flex-wrap: wrap;
    }
    &_Card {
        margin: 0 25px 25px;
        width: 15%;
        word-break: break-all;
        text-align: center;
    }
    &_CardImage {
        margin-bottom: 15px;
    }
    &_IngredientCreateModal {

    }
}
</style>
