<template lang="pug">
    div.IngredientProfile
        div.IngredientProfile_Image
            ingredient-image(:imageUrl="newIngredient.image_url" @change="updateImage")
        div.IngredientProfile_InfoContainer
            div.IngredientProfile_FormItem
                div.IngredientProfile_FormLabel Name_jp
                el-input(v-model="newIngredient.japanese_name")
            div.IngredientProfile_FormItem
                div.IngredientProfile_FormLabel Name_en
                el-input(v-model="newIngredient.english_name")
            div.IngredientProfile_FormItem
                div.IngredientProfile_FormLabel Seasons
                el-checkbox-group(v-model="selectedSeasons" @change="setSeasons")
                    el-checkbox(v-for="(season, index) in newIngredient.seasons"
                                :key="index"
                                :label="`${String(index + 1)}月`"
                                :checked="season")
            div.IngredientProfile_FormItem
                div.IngredientProfile_FormLabel Location
                el-select(v-model="newIngredient.local_location_name" class="Top_SelectBox")
                    el-option(
                        v-for="(value, key) in prefectures"
                        :key="key"
                        :label="value"
                        :value="value"
                    ) {{value}}
            div.IngredientProfile_FormItem
                div.IngredientProfile_FormLabel Sub_category
            div.IngredientProfile_UpdataButton
                el-button(@click="update" type="danger" :disabled="!isUpdated") Update
</template>

<script>
import IngredientImage from '~/components/IngredientImage'
import prefectures from '~/assets/prefectures.js'
import loading from '~/assets/loading.js'

export default {
    name: 'IngredientProfile',
    mixins: [loading, prefectures],
    props: {
        ingredient: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            newIngredient: {},
            selectedSeasons: [],
            isUpdated: false,
            selectedImage: ''
        }
    },
    components:{
        IngredientImage
    },
    mounted() {
        this.newIngredient = JSON.parse(JSON.stringify(this.ingredient))
    },
    watch: {
        ingredient: {
            handler: function (val, oldVal) {
                this.newIngredient = JSON.parse(JSON.stringify(this.ingredient))
            },
            deep: true
        },
        newIngredient: {
            handler: function (val, oldVal) {
                if(Object.keys(oldVal).length == 0) return false
                this.isUpdated = JSON.stringify(this.ingredient) === JSON.stringify(val) ? false : true
            },
            deep: true
        },
    },
    methods: {
        update() {
            this.isUpdated = false
            if(this.selectedImage) {
                // Image is updated
                this.$emit('updateWithImage', {profile: this.newIngredient, image: this.selectedImage})
            }else{
                this.$emit('update', this.newIngredient)
            }
        },
        setSeasons(seasonNumbers) {
            seasonNumbers = seasonNumbers.map(season => {
                return Number(season.replace('月', '')) - 1
            })
            const seasons = [...Array(12).keys()].map(num => {
                return seasonNumbers.includes(num) ? true : false
            })
            this.newIngredient.seasons = seasons
        },
        updateImage(file) {
            this.isUpdated = true
            this.selectedImage = file
        }
    }
}
</script>


<style lang="scss" scoped>
.IngredientProfile {
    display: flex;
    &_Image {
        margin-right: 150px;
        img {
            object-fit: contain;
        }
    }
    &_InfoContainer {
        display: flex;
        flex-direction: column;
    }
    &_FormItem {
        max-width: 500px;
        &:nth-last-of-type(n+2) {
            margin-bottom: 30px;
        }
    }
    &_FormLabel {
        margin-bottom: 10px;
    }
    &_UpdataButton {
        margin-left: auto;
    }
}
</style>