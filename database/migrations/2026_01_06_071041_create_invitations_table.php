<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('template_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->unique();

            $table->string('event_name');
            $table->string('host_name');

            $table->string('venue_name');
            $table->string('venue_address')->nullable();

            $table->date('event_date');
            $table->time('event_time');

            $table->string('complementary_text_1')->nullable();
            $table->string('complementary_text_2')->nullable();
            $table->string('complementary_text_3')->nullable();

            $table->string('gift_type')->nullable();
            $table->string('dress_code')->nullable();

            $table->unsignedInteger('capacity')->default(0);
            $table->dateTime('rsvp_deadline_at')->nullable();

            $table->string('status')->default('draft'); // draft|published
            $table->dateTime('published_at')->nullable();

            $table->json('settings')->nullable(); //template design

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
