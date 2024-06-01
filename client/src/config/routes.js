const routes = {
  home: '/',
  signIn: '/login',
  register: '/register',
  logout: '/logout',
  productdetails: '/products/:title/:id',
  search: '/search/:title',
  cart: '/cart',
  cat: '/cat',
  404: '*',

  // users needs to login
  profile: '/user/account/profile',
  purchaseOrder: '/user/account/purchase',
  address: '/user/account/address',
  changePassword: '/user/account/change_password',
  bank: '/user/account/bank',
  notification: '/user/account/notification',
  voucher: '/user/account/voucher',
  userbank: '/user/account/bank',
};

export const adminRoutes = {
  Logo: '/admin/logo',
  AddLogo: '/admin/add-logo',
  SignIn: '/admin/login',
  ResetPassword: '/admin/resetpass',
  Home: '/admin',
  ProfileAdmin: '/admin/profile',
  AllAdmin: '/admin/admin',
  EditAdmin: '/admin/edit-admin/:id',
  AddAdmin: '/admin/add-admin',
  AllUser: '/admin/user',
  EditUser: '/admin/edit-user/:id',
  AddUser: '/admin/add-user',
  AllShop: '/admin/shop',
  EditShop: '/admin/edit-shop/:id',
  AddShop: '/admin/add-shop',
  Location: '/admin/location',
  Category: '/admin/category',
  Blogs: '/admin/blogs',
  EditBlogs: '/admin/edit-blogs/:id',
  AddBlogs: '/admin/add-blogs',
  Department: '/admin/department',
  OrderProduct: '/admin/order',
  AllProduct: '/admin/product',
  AddProduct: '/admin/add-product',
  EditProduct: '/admin/edit-product',
  EditProduct: '/admin/edit-product/:name-:id',
  ReportProduct: '/admin/report-product',
  Voucher: '/admin/voucher',
  AddVoucher: '/admin/add-voucher',
  EditVoucher: '/admin/edit-voucher/:id',
  Manufacturer: '/admin/manufacturer',
  Role: '/admin/role',
};

export default routes;
