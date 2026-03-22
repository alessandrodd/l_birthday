const pages = [
  // Keep this one for index page
  {
    title: 'index',
    folder: '',
    output_folder: ''
  }
];

const publicPath = '';

const appName = 'Laura Bird';
const shortAppName = 'Laura Bird';
const GA4_MEASUREMENT_ID = false; // Set to false to disable
const SITE_NAME = 'Laura Bird';
const PRODUCT_ICON = {
  href: './icon_512x512.png',
  width: '1024',
  height: '1024'
};

const PWA = {
  theme_color: '#272738',
  background: '#3a3a3c'
};

const DEV_ADDR = {
  host: 'localhost',
  port: 3000
};

const MISC_CONF = {
  windowResizeable: false,
  availableOffline: false
}


const SHARED_ENV = {
  availableOffline: MISC_CONF.availableOffline,
  windowResizeable: MISC_CONF.windowResizeable,
  themeColor: PWA.theme_color,
  backgroundColor: PWA.background
}

export default {
  DEV_ADDR,
  pages,
  publicPath,
  appName,
  shortAppName,
  GA4_MEASUREMENT_ID,
  SITE_NAME,
  PRODUCT_ICON,
  PWA,
  MISC_CONF,
  SHARED_ENV

};
