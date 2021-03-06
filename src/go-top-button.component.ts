import {Component, HostListener, Input, OnInit} from '@angular/core';
import {trigger, state, style, transition, animate} from '@angular/animations';

@Component({
    selector: 'go-top-button',
    template: `<button type="button" class="go-top-button"
                        [@appearInOut]="animationState"
                        (click)="scrollTop($event)"
                        [ngStyle]="getStyle()">
                    <span *ngIf="html" [innerHTML]="html">
                    </span>
                </button>`,
    styles: [
        `.go-top-button {
            position: fixed;
            z-index: 9999;
            cursor: pointer;
            display: none;
            text-decoration: none;
            text-align: center;
            outline: none;
            width: 52px;
            height: 52px;
            right: 40px;
            bottom: 40px;
            font-size: 45px;
            line-height: 46px;
            opacity: 0.4;
        }
        
        .go-top-button:hover, .go-top-button:focus {
            background-color: rgba(0, 0, 0, 0.6);
            text-decoration: none;
            color: white;
            opacity: 0.8
        }`
    ],
    animations: [
        trigger('appearInOut', [
            state('in', style({
                'display': 'block',
                'opacity': '0.85'
            })),
            state('out', style({
                'display': 'none',
                'opacity': '0'
            })),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out'))
        ]),
    ],
})

/**
 * Component for adding a go-to-top button to scrollable browser content
 */
export class GoTopButton implements OnInit {
    animationState: string = 'out';

    /**
     * Default button styles
     * @type {{position: string;
     * top: string;
     * bottom: string;
     * right: string;
     * width: string;
     * height: string;
     * line-height: string;
     * text-decoration: string;
     * color: string;
     * background: string;
     * border: string;
     * border-radius: string}}
     */
    private defaultStyles: any = {
        'color': '#f44336',
        'background': 'rgba(0, 0, 0, 0.3)',
        'border-radius': '50%',

    };

    /**
     * Go top button will appear when user scrolls Y to this position
     * @type {number}
     */
    @Input() scrollDistance: number = 200;

    /**
     * Button inner html
     * @type {string}
     */
    @Input() html: string = '';

    /**
     * User styles config object
     * @type {{}}
     */
    @Input() styles: any = {};

    /**
     * If true scrolling to top will be animated
     * @type {boolean}
     */
    @Input() animate: boolean = false;

    /**
     * Animated scrolling speed
     */
    @Input() speed: number = 80;

    /**
     * Acceleration coefficient, added to speed when using animated scroll
     * @type {number}
     */
    @Input() acceleration: number = 0;

    @Input() activeSite: any;

    ngOnInit(){
        if (this.activeSite && this.activeSite.webSetting.hasOwnProperty('backToTop')) {
            this.defaultStyles = {
                'color': this.activeSite.webSetting.backToTop.color,
                'background': this.activeSite.webSetting.backToTop.background,
                'border-radius': this.activeSite.webSetting.backToTop.borderRadius + '%'
            };
        }
        this.validateInputs();
    }

    private validateInputs =() => {
        let errorMessagePrefix = 'GoTopButton component input validation error: ';

        if(this.scrollDistance < 0){
            throw Error(errorMessagePrefix + "'scrollDistance' parameter must be greater or equal to 0");
        }

        if(this.speed < 1){
            throw Error(errorMessagePrefix + "'speed' parameter must be a positive number");
        }

        if(this.acceleration < 0){
            throw Error(errorMessagePrefix + "'acceleration' parameter must be greater or equal to 0");
        }
    };

    /**
     * Listens to window scroll and animates the button
     */
    @HostListener('window:scroll', [])
    onWindowScroll = () => {
        if(this.isBrowser()){
            this.animationState = this.getCurrentScrollTop() > this.scrollDistance ? 'in' : 'out';
        }
    };

    /**
     * Scrolls window to top
     * @param event
     */
    scrollTop = (event: any) => {
        if(!this.isBrowser()){
            return;
        }

        event.preventDefault();
        if (this.animate) {
            this.animateScrollTop();
        } else {
            window.scrollTo(0, 0);
        }
    };

    /**
     * Performs the animated scroll to top
     */
    animateScrollTop = () => {
        var initialSpeed = this.speed;
        var timerID = setInterval(() => {
            window.scrollBy(0, -initialSpeed);
            initialSpeed = initialSpeed + this.acceleration;
            if (this.getCurrentScrollTop() == 0)
                clearInterval(timerID);
        }, 15);
    };

    /**
     * Get current Y scroll position
     * @returns {any|((event:any)=>undefined)}
     */
    getCurrentScrollTop = () => {
        if(typeof window.scrollY != 'undefined'){
            return window.scrollY;
        }

        if(typeof window.pageYOffset != 'undefined'){
            return window.pageYOffset;
        }

        if(typeof document.body.scrollTop != 'undefined'){
            return document.body.scrollTop;
        }

        if(typeof document.documentElement.scrollTop != 'undefined'){
            return document.documentElement.scrollTop;
        }

        return 0;
    };

    /**
     * Get button style
     * @returns {{}&U&V}
     */
    getStyle = () => {
        if (this.styles) {
            return Object.assign({}, this.styles);
        } else {
            return Object.assign({}, this.defaultStyles);
        }

    };

    /**
     * This check will prevent 'window' logic to be executed
     * while executing the server rendering
     * @returns {boolean}
     */
    isBrowser = ():boolean => {
        return typeof (window) !== 'undefined';
    };
}