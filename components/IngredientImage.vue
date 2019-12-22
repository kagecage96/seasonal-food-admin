<template lang="pug">
    label
        div.IngredientImage
            img(v-if="newImage" :src="newImage" class="ingredient")
            i(v-else class="el-icon-plus avatar-uploader-icon")
        input(type="file" @change="onFileChange")
</template>

<script>
export default {
    data() {
        return {
            newImage: ''
        }
    },
    props: {
        imageUrl: {
            required: true
        }
    },
    watch: {
        imageUrl() {
            this.newImage = this.imageUrl
        }
    },
    methods: {
        onFileChange(e) {
            let files = e.target.files || e.dataTransfer.files;
            this.$emit('change', files[0])
            this.createImage(files[0]);
        },
        // アップロードした画像を表示
        createImage(file) {
            let reader = new FileReader();
            reader.onload = (e) => {
                this.newImage =e.target.result
                // this.$emit('input', )
            };
            reader.readAsDataURL(file);
        },
    }
}
</script>


<style lang="scss" scoped>
.IngredientImage {
    border: solid 1px #d9d9d9;
    cursor: pointer;
    width: 300px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 15px;
}
.ingredient {
    width: 300px;
    height: 300px;
    display: block;
    object-fit: contain;
}
</style>