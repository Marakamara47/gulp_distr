const {src, dest, watch, parallel, series} = require('gulp');//подключение галпа и методов

const scss = require('gulp-sass');//плагин для работы с препроцесорами
const concat = require('gulp-concat');//плагин для конкатинации
const browserSync = require('browser-sync').create();//плагин для синхронизации браузера
const uglify = require('gulp-uglify-es').default;//плагин для минификации джаваскрипт
const autoprefixer = require('gulp-autoprefixer');//плагин для работы с вендорными префиксами стилей
const imagemin = require('gulp-imagemin');//плагин для минификации картинок
const del = require('del');//плагин для удаления

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'//базовая директория для запущеного сервера
        }
    });
}//функция для запуска сервера

function cleanDist() {
    return del('dist');//адрес для удаления
}//функция для удаления 

function images() {
    return src('app/images/**/*')//адрес для исходников
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))//настройки минификатора
    .pipe(dest('dist/images'));//адрес для результата
}//функция для работы с картинками

function scripts() {
    return src([
        'app/js/test.js',
        'app/js/main.js'
    ])//список файлов исходников
    .pipe(concat('main.min.js'))//называет файл и собирает их в кучу
    .pipe(uglify())//обработка плагином c минификацией
    .pipe(dest('app/js'))//куда поместить результат
    .pipe(browserSync.stream());//перзапускает сервер после выполнения задачи
}//функция для работы со скриптами

function styles() {
    return src('app/scss/style.scss')//исходники
    .pipe(scss({outputStyle: 'compressed'}))//обработка плагином c минификацией
    .pipe(concat('style.min.css'))//называет файл и собирает их в кучу
    .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 version'],
        grid: true
    }))//добавляет префиксы по указаному списку версий браузеров
    .pipe(dest('app/css'))//куда поместить результат
    .pipe(browserSync.stream());//перзапускает сервер после выполнения задачи
}// функция конвертации стилей

function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ],{base: 'app'})//масив с адресами нужных файлов и директива для создания папок начиная с определенной точки
    .pipe(dest('dist'));//адрес куда поместить
}//функция для сбора проекта

function watching() {
    watch(['app/scss/**/*.scss'], styles);//здесь указано за чем следить и какую функцию запускать
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);//здесь указано за чем следить и какую функцию запускать
    watch(['app/*.html']).on('change', browserSync.reload);//здесь указано за чем следить и какую функцию запускать
}// функция наблюдатель для обновления файлов после изменений на лету

exports.styles = styles;//создание команды для галпа с соответствующей фунцией
exports.watching = watching;//создание команды для галпа с соответствующей фунцией
exports.browsersync = browsersync;//создание команды для галпа с соответствующей фунцией
exports.scripts = scripts;//создание команды для галпа с соответствующей фунцией
exports.cleanDist = cleanDist;//создание команды для галпа с соответствующей фунцией
exports.images = images;//создание команды для галпа с соответствующей фунцией

exports.build = series(cleanDist, images, build);//сборка проекта с удалением старого и минификациек картинок
exports.default = parallel(styles, scripts, browsersync, watching);//паралельный запуск команд по дефолту
