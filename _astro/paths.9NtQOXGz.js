function r(t){return/^(https?:)?\/\//.test(t)||t.startsWith("data:")||t.startsWith("mailto:")||!t.startsWith("/")?t:`${"/DOTsolutionsWEB".replace(/\/$/,"")}${t}`}export{r as w};
