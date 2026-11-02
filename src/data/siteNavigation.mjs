import {partCategories,partCategoryHref} from './partTaxonomy.mjs';
import { materialNavigation } from './materialNavigation.mjs';
import {industryNavigation} from './industryNavigation.mjs';

export function getSiteNavigation(pathname='/') {
  const items=[
    {label:'Home',href:'/'},
    {label:'Services',href:'/services',children:[
      {label:'CNC Turning and Milling',href:'/services/cnc-turning-and-milling'},
      {label:'Swiss Machining',href:'/services/swiss-machining'},
      {label:'3-Axis CNC Machining',href:'/services/3-axis-cnc-machining'},
      {label:'5-Axis CNC Machining',href:'/services/5-axis-cnc-machining'},
    ]},
    {label:'Custom Parts',href:'/custom-cnc-parts',children:[
      ...partCategories.map(category=>({label:category.label,href:partCategoryHref(category.id)})),
    ]},
    {label:'Materials',href:'/materials',children:materialNavigation},
    {label:'Industries',href:'/industries',children:industryNavigation.flatMap(group=>group.children)},
    {label:'Resources',id:'resources',sectionPath:'/resources',children:[
      {label:'Blog',href:'/blog'},
      {label:'FAQ',href:'/resources/faqs'},
      {label:'Equipment List',href:'/resources/equipment-list'},
    ]},
    {label:'About Us',href:'/about-us'},
    {label:'Get A Quote',href:'/cnc-machining-quote'},
  ];
  const matches=href=>href==='/'?pathname==='/':Boolean(href&&(pathname===href||pathname.startsWith(href+'/')));
  return items.map(item=>({...item,active:matches(item.href||item.sectionPath)||(item.children||[]).some(child=>matches(child.href))}));
}
