import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { BlogPostService } from '../services/blog-post.service';
import { BlogPost } from '../models/blog-post.model';
import { CategoryService } from '../../category/services/category.service';
import { Category } from '../../category/models/category.model';
import { publishFacade } from '@angular/compiler';
import { UpdateBlogPost } from '../models/update-blog-post.model';

@Component({
  selector: 'app-edit-blogpost',
  templateUrl: './edit-blogpost.component.html',
  styleUrls: ['./edit-blogpost.component.css']
})
export class EditBlogpostComponent implements OnInit, OnDestroy {
  id: string | null = null;
  model?: BlogPost
  routeSubscription?: Subscription;
  updateBlogPostSubscription?:Subscription;
  getBlogPostSubscription?:Subscription;
  deleteBlogPostSubscription?:Subscription;
  categories$?:Observable<Category[]>;
  selectedCategories?:string[];
  isImageSelectorVisible : boolean = false;

  constructor(private route: ActivatedRoute, 
    private blogPostService:BlogPostService,
  private categoryService:CategoryService,
private router:Router){

  }
  
  ngOnInit(): void {
    this.categories$=this.categoryService.getAllCategories();
   this.routeSubscription = this.route.paramMap.subscribe({
      next: (params) => {
       this.id = params.get('id');

       //Get BLogPost from API
       if(this.id){
      this.getBlogPostSubscription = this.blogPostService.getBlogPostById(this.id).subscribe({
        next:(responce)=> {
          this.model = responce;
          this.selectedCategories=responce.categories.map(x=>x.id);
        }
       });

      }}
    });
  }

  onFormSubmit(): void {
    //Convert this model to Request Object
    if(this.model && this.id){
      var updateBlogPost: UpdateBlogPost={
        author: this.model.author,
        content: this.model.content,
        shortDescription: this.model.shortDescription,
        featuredImageUrl: this.model.featuredImageUrl,
        isVisible: this.model.isVisible,
        publishedDate: this.model.publishedDate,
        title: this.model.title,
        urlHandle: this.model.urlHandle,
        categories: this.selectedCategories ?? []
      };

     this.updateBlogPostSubscription = this.blogPostService.updateBlogPost(this.id, updateBlogPost)
      .subscribe({
        next: (response) => {
            this.router.navigateByUrl('/admin/blogposts');
        }
      });
    }
  }

  openImageSelector():void{
    this.isImageSelectorVisible=true;
  }

  closeImageSelector():void{
    this.isImageSelectorVisible=false;
  }

  onDelete():void{
    if(this.id){
      //call service and delete blogpost
    this.deleteBlogPostSubscription = this.blogPostService.deleteBlogPost(this.id)
      .subscribe({
        next: (response)=>{
          this.router.navigateByUrl('/admin/blogposts');
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.updateBlogPostSubscription?.unsubscribe();
    this.getBlogPostSubscription?.unsubscribe();
    this.deleteBlogPostSubscription?.unsubscribe();
  }

}
