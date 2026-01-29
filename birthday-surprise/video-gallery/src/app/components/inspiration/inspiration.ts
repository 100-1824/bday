import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-inspiration',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './inspiration.html',
    styleUrls: ['./inspiration.css']
})
export class InspirationComponent {
    activeTab: 'vision' | 'birthday' = 'vision';

    visionBoards = [
        { id: 1, title: 'Bible Vision Board', image: '/assets/images/vision-board.jpg', placeholderColor: '#E1BEE7' },
        { id: 2, title: 'Church & Home', image: '/assets/images/church-home-board.jpg', placeholderColor: '#C5CAE9' },
        { id: 3, title: 'Dream Home / Dream Place', image: '/assets/images/farm-home-board.jpg', placeholderColor: '#C8E6C9' },
        { id: 4, title: 'Career', image: '/assets/images/career-board.jpg', placeholderColor: '#B2EBF2' },
        { id: 5, title: 'Umzy (You & Me)', image: '/assets/images/umzy-board.jpg', placeholderColor: '#FFCDD2' },
        { id: 6, title: 'Overall Vision', image: '/assets/images/overall-board.jpg', placeholderColor: '#D7CCC8' }
    ];

    birthdayVerses = [
        {
            ref: 'Numbers 6:24-26',
            text: 'The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you; the Lord turn his face toward you and give you peace.',
            theme: 'Blessing'
        },
        {
            ref: 'Jeremiah 29:11',
            text: 'For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.',
            theme: 'Future'
        },
        {
            ref: 'Psalm 139:14',
            text: 'I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.',
            theme: 'Creation'
        },
        {
            ref: 'Zephaniah 3:17',
            text: 'The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.',
            theme: 'Delight'
        }
    ];

    setActiveTab(tab: 'vision' | 'birthday') {
        this.activeTab = tab;
    }
}
