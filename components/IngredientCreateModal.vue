<template lang="pug">
    div.IngredientCreateModal
        div(@click.self="closeModal" class="IngredientCreateModal_Layer")
        el-form(ref="ArticleForm" @submit.prevent="" class="IngredientCreateModal_Container")
            div.IngredientCreateModal_FormItemContainer
                h2.IngredientCreateModal_FormItemLabel._isTitle Create a new ingredient
            div.IngredientCreateModal_FormItemContainer
                div.IngredientCreateModal_FormItemLabel Image
                ingredient-image(:imageUrl="ingredient.image_url" @change="updateImage")
            div(v-for="key in inputType" class="IngredientCreateModal_FormItemContainer")
                div.IngredientCreateModal_FormItemLabel {{key}}
                el-input(v-model="ingredient[key]")
            div(class="IngredientCreateModal_FormItemContainer")
                div.IngredientCreateModal_FormItemLabel sub_category
                el-select(v-model="ingredient.sub_category" class="Top_SelectBox")
                    el-option(
                        v-for="(value, key) in subCategories"
                        :key="key"
                        :label="value.name"
                        :value="value.name"
                    ) {{value.name}}
            div(class="IngredientCreateModal_FormItemContainer")
                div.IngredientCreateModal_FormItemLabel sub_category_name_jp
                el-select(v-model="ingredient.sub_category_name_jp" class="Top_SelectBox")
                    el-option(
                        v-for="(value, key) in subCategories"
                        :key="key"
                        :label="value.jp_name"
                        :value="value.jp_name"
                    ) {{value.jp_name}}
            div(class="IngredientCreateModal_FormItemContainer")
                div.IngredientCreateModal_FormItemLabel seasons
                el-checkbox-group(v-model="selectedSeasons" @change="setSeasons")
                    el-checkbox(v-for="(season, index) in ingredient.seasons"
                                :key="index"
                                :label="`${String(index + 1)}月`"
                                :checked="season")
            div(class="IngredientCreateModal_FormItemContainer")
                div.IngredientCreateModal_FormItemLabel local_location_name
                el-select(v-model="ingredient.local_location_name" class="Top_SelectBox")
                    el-option(
                        v-for="(value, key) in prefectures"
                        :key="key"
                        :label="value"
                        :value="value"
                    ) {{value}}
            el-button(type="primary" class="IngredientCreateModal_SubmitButton"
                @click="createIngredient"
                :disabled="isDisabled") Create
</template>

<script>
import { db } from '~/plugins/firebase.js'

import IngredientImage from '~/components/IngredientImage'
import prefectures from '~/assets/prefectures.js'
import loading from '~/assets/loading.js'
import { mapGetters } from 'vuex'

export default {
    name: 'IngredientCreateModal',
    mixins: [loading, prefectures],
    async fetch({store}) {
        await store.dispatch('subCategories', 'getSubCategories')
    },
    data() {
        const seasons = (new Array(12)).fill(false)
        return {
            ingredient: {
                articles_ids: [],
                image_url: '',
                japanese_name: '',
                local_location_name: '',
                name: '',
                seasons: seasons,
                sub_category_id: '',
                sub_category: '',
                sub_category_name_jp: '',
            },
            sub_categories: [],
            selectedSeasons: [],
            inputType: ['name', 'japanese_name'],
            preventDuplicate: false
        }
    },
    components: {
        IngredientImage
    },
    computed: {
        ...mapGetters('subCategories', ['subCategories']),
        isDisabled() {
            return this.ingredient.name.length == 0 || this.ingredient.image_url.length == 0 || this.preventDuplicate
        }
    },
    watch: {
        'ingredient.sub_category': function(val) {
            const subCategory = this.subCategories.find(subCategory => subCategory.name == val)
            this.ingredient.sub_category_name_jp = subCategory.jp_name
            this.ingredient.sub_category_id = subCategory.id
        },
        'ingredient.sub_category_name_jp': function(val) {
            const subCategory = this.subCategories.find(subCategory => subCategory.jp_name == val)
            this.ingredient.sub_category = subCategory.name
            this.ingredient.sub_category_id = subCategory.id
        },
    },
    methods: {
        setSeasons(seasonNumbers) {
            seasonNumbers = seasonNumbers.map(season => {
                return Number(season.replace('月', '')) - 1
            })
            const seasons = [...Array(12).keys()].map(num => {
                return seasonNumbers.includes(num) ? true : false
            })
            this.ingredient.seasons = seasons
        },
        closeModal() {
            this.$emit('close')
            this.init()
        },
        updateImage(file) {
            this.ingredient.image_url = file
        },
        createIngredient() {
            this.preventDuplicate = true
            this.$emit('create', this.ingredient)
        },
        init() {
            const seasons = (new Array(12)).fill(false)
            this.preventDuplicate = false
            this.ingredient = {
                articles_ids: [],
                image_url: '',
                japanese_name: '',
                local_location_name: '',
                name: '',
                seasons: seasons,
                sub_category: '',
                sub_category_name_jp: ''
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.IngredientCreateModal {
    &_Layer {
        position: fixed;
        background: #00000047;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        cursor: pointer;
    }
    &_Container {
        position: fixed;
        z-index: 2;
        width: 80%;
        top: 30px;
        bottom: 30px;
        left: 0;
        right: 0;
        background: white;
        margin: auto;
        padding: 50px 80px;
        overflow: scroll;
        display: flex;
        flex-direction: column;
    }
    &_SubCategory {
        &:nth-last-of-type(n+2) {
            margin-bottom: 20px;
        }
    }
    &_FormItemContainer {
        margin-bottom: 25px;
        &:last-of-type {
            margin-bottom: 80px;
        }
    }
    &_FormItemLabel {
        margin-bottom: 8px;
    }
    &_SubCategoryContainer {
        margin-bottom: 20px;
    }
    &_AddSubCategoryButton {
        text-align: center;
    }
    &_SubmitButton {
        margin-top: auto;
    }
}
</style>